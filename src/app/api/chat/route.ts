// ============================================================================
// VietBridge AI V2 — Unified Chat API Endpoint
// Handles all 4 tasks: translate, reply, risk, learn
// Supports both streaming (SSE) and non-streaming modes
// Pipeline: Auth → Validate → Rate-limit → Quota → Intent → Model → LLM → Log → Persist
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { chatSchema } from "@/lib/validators/chat";
import { checkRateLimit, checkApiKeyRateLimit } from "@/lib/rate-limit";
import { checkUsageQuota, logUsage } from "@/lib/usage";
import { authenticateApiKey } from "@/lib/api-key-auth";
import {
  checkMonthlyCostLimit,
  checkGlobalCostLimit,
  type CostCheckResult,
} from "@/lib/cost-limit";
import { detectIntent } from "@/lib/llm/intent-detector";
import { selectModel } from "@/lib/llm/model-router";
import { buildPrompt, flattenToMessages } from "@/lib/llm/prompt-builder";
// getClient is now used via callLLM/callLLMStream
import { generateResponse } from "@/lib/llm/response-generator";
import { getABPromptOverride } from "@/lib/llm/prompt-version";
import { lookupModelRoute } from "@/lib/llm/route-lookup";
import { callLLM, callLLMStream } from "@/lib/llm/llm-call";
import { checkProactiveWarnings } from "@/lib/intelligence/proactive";
import { searchKnowledgeBase, type KBHit } from "@/lib/intelligence/knowledge-base";
import { searchDBKnowledge } from "@/lib/intelligence/kb-db";
import { estimateTokens } from "@/lib/token-estimator";
import { prisma } from "@/lib/prisma";
import { sanitizeForLog } from "@/lib/sanitize";
import { computeEntryHash } from "@/lib/audit-hash";
import type { TaskId } from "@/lib/intelligence/tasks";
import type { SceneId } from "@/lib/intelligence/scene-rules";

// Map task IDs to Prisma enums
const TASK_MAP: Record<string, string> = {
  translate: "TRANSLATION",
  reply: "REPLY",
  risk: "RISK",
  learn: "LEARN",
};

const SCENE_MAP: Record<string, string> = {
  general: "GENERAL",
  business: "BUSINESS",
  staff: "STAFF",
  couple: "COUPLE",
  restaurant: "RESTAURANT",
  rent: "RENT",
  hospital: "HOSPITAL",
  repair: "REPAIR",
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // ── 1. Auth (API Key, Mobile Bearer, or Session) ─────────────────────
    let userId: string;
    let userRole: string;
    let apiKeyId: string | undefined;
    let apiKeyPrefix: string | undefined;

    const apiKeyAuth = await authenticateApiKey(req);
    if (apiKeyAuth) {
      if (!apiKeyAuth.authenticated) {
        return NextResponse.json(
          { error: apiKeyAuth.error },
          { status: 401 }
        );
      }
      userId = apiKeyAuth.userId!;
      userRole = apiKeyAuth.userRole!;
      apiKeyId = apiKeyAuth.apiKeyId;
      apiKeyPrefix = apiKeyAuth.apiKeyPrefix;
    } else {
      // Try mobile Bearer token, then fall back to web session
      const authUser = await getAuthUser(req);
      if (!authUser?.id) {
        return NextResponse.json({ error: "未登录" }, { status: 401 });
      }
      userId = authUser.id;
      userRole = authUser.role;
    }

    // ── 2. Validate ────────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "参数错误" },
        { status: 400 }
      );
    }
    const { input, langDir, conversationHistory } = parsed.data;
    const conversationId = parsed.data.conversationId;
    const stream = parsed.data.stream;
    // Normalize tone from 0-100 (frontend slider) to 1-10 (prompt builder)
    const tone = Math.max(1, Math.min(10, Math.round((parsed.data.tone / 100) * 9 + 1)));

    // ── 3. Rate limit (API Key vs Session) ─────────────────────────────
    if (apiKeyId && apiKeyPrefix) {
      const rateResult = await checkApiKeyRateLimit(apiKeyPrefix);
      if (!rateResult.success) {
        return NextResponse.json(
          { error: "API请求太频繁，请稍后再试" },
          {
            status: 429,
            headers: {
              "X-RateLimit-Remaining": String(rateResult.remaining),
              "X-RateLimit-Reset": String(rateResult.reset),
              "Retry-After": String(
                Math.ceil((rateResult.reset - Date.now()) / 1000)
              ),
            },
          }
        );
      }
    } else {
      const rateResult = await checkRateLimit(userId);
      if (!rateResult.success) {
        return NextResponse.json(
          { error: "请求太频繁，请稍后再试", remaining: rateResult.remaining },
          { status: 429 }
        );
      }
    }

    // ── 4. Quota check ─────────────────────────────────────────────────────
    const quota = await checkUsageQuota(userId);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: "今日额度已用完", used: quota.used, limit: quota.limit, upgrade: true },
        { status: 403 }
      );
    }

    // ── 4b. Monthly cost limit ──────────────────────────────────────────
    const globalCost = await checkGlobalCostLimit();
    if (!globalCost.allowed) {
      return NextResponse.json(
        { error: globalCost.message },
        { status: 503 }
      );
    }
    const costCheck: CostCheckResult = await checkMonthlyCostLimit(userId);
    if (!costCheck.allowed) {
      return NextResponse.json(
        { error: costCheck.upgradeMessage, upgrade: true },
        { status: 403 }
      );
    }

    // ── 5. Intent detection ────────────────────────────────────────────────
    const intent = detectIntent(input);
    const task: TaskId = (parsed.data.task || intent.task) as TaskId;
    const scene: SceneId = (parsed.data.scene || intent.scene || "general") as SceneId;

    // ── 5b. Knowledge base search (local + DB) ────────────────────────────
    const localKBHits = searchKnowledgeBase(input, scene);
    const dbKBHits = await searchDBKnowledge(input, scene);
    // Merge and deduplicate by detail text
    const seenDetails = new Set<string>();
    const kbHits: KBHit[] = [];
    for (const hit of [...localKBHits, ...dbKBHits]) {
      const key = hit.detail.substring(0, 50);
      if (!seenDetails.has(key)) {
        seenDetails.add(key);
        kbHits.push(hit);
      }
    }
    const hasRAGHit = kbHits.length > 0;

    // ── 6. Model routing ───────────────────────────────────────────────────
    let isPro = userRole === "pro" || userRole === "admin";
    let downgradeWarning: string | undefined;
    if (costCheck.shouldDowngrade && isPro) {
      isPro = false;
      downgradeWarning = "本月费用接近上限，已自动降级到基础模型以节省成本。";
    }
    const model = selectModel({ task, scene, input, isPro });

    // ── 6b. Route config (fallback, cost limit) ───────────────────────────
    const routeConfig = await lookupModelRoute(
      TASK_MAP[task] || task,
      SCENE_MAP[scene] || scene
    );

    // ── 6c. Prompt version (active or AB test) ─────────────────────────────
    const abResult = await getABPromptOverride(userId);

    // ── 7. Build 7-layer prompt ────────────────────────────────────────────
    const memory = {
      role: "用户",
      location: "岘港",
      preferredTone: tone,
      isPro,
    };
    const promptResult = buildPrompt({
      task,
      scene,
      tone,
      memory,
      input,
      conversationHistory,
      kbHits,
      promptOverride: abResult.override || undefined,
    });

    // ── 8. Prepare LLM call ──────────────────────────────────────────────
    const messages = flattenToMessages(promptResult.layers);
    const provider = model.tier === "pro" ? "openai" : "qwen";
    const modelName = provider === "openai" ? "gpt-4o" : "qwen-plus";

    // ── 8b. Single-request cost pre-check ─────────────────────────────────
    if (routeConfig?.maxCost) {
      const costPerToken = provider === "openai" ? 0.000005 : 0.000001;
      const estCost = estimateTokens(messages.map((m) => m.content).join("")) * costPerToken;
      if (estCost > routeConfig.maxCost) {
        return NextResponse.json(
          { error: "请求内容过长，预估成本超过单次限额" },
          { status: 403 }
        );
      }
    }

    // ── 9. Ensure/create conversation record ─────────────────────────────
    let convId = conversationId;
    if (!convId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId,
          taskType: TASK_MAP[task] as "TRANSLATION" | "REPLY" | "RISK" | "LEARN",
          sceneType: SCENE_MAP[scene] as "GENERAL" | "BUSINESS" | "STAFF" | "COUPLE" | "RESTAURANT" | "RENT" | "HOSPITAL" | "REPAIR",
          title: input.substring(0, 50),
        },
      });
      convId = conversation.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content: input,
      },
    });

    // ── 10. Streaming vs Non-streaming ───────────────────────────────────
    if (stream) {
      return handleStreamingResponse({
        modelName,
        messages,
        task,
        scene,
        tone,
        input,
        model,
        promptResult,
        conversationHistory,
        userId,
        convId,
        startTime,
        intent,
        kbHits,
        hasRAGHit,
        costWarning: costCheck.warning,
        downgradeWarning,
        abGroup: abResult.abGroup || undefined,
        fallbackModel: routeConfig?.fallbackModel,
        maxLatency: routeConfig?.maxLatency,
      });
    }

    // ── Non-streaming path ───────────────────────────────────────────────
    const llmResult = await callLLM({
      messages,
      primaryModel: modelName,
      fallbackModel: routeConfig?.fallbackModel,
      maxLatency: routeConfig?.maxLatency,
      temperature: 0.7,
      maxTokens: 2000,
    });

    const output = llmResult.output;
    const actualModelUsed = llmResult.modelUsed;
    const actualProvider = llmResult.provider;
    const tokensPrompt = llmResult.tokensPrompt;
    const tokensCompletion = llmResult.tokensCompletion;
    const latency = Date.now() - startTime;
    const costPerToken = actualProvider === "openai" ? 0.000005 : 0.000001;
    const cost = (tokensPrompt + tokensCompletion) * costPerToken;

    // Parse and structure response
    const proactiveWarnings = checkProactiveWarnings(input, scene, tone);
    const structuredResponse = generateResponse({
      rawOutput: output,
      task,
      scene,
      tone,
      input,
      modelName: actualModelUsed,
      modelReason: llmResult.usedFallback ? `${model.reason} (fallback)` : model.reason,
    });

    // Log usage
    await logUsage({
      userId,
      taskType: task.toUpperCase(),
      sceneType: scene.toUpperCase(),
      modelUsed: actualModelUsed,
      tokensPrompt,
      tokensCompletion,
      cost,
      latency,
      riskScore: (structuredResponse.data as { score?: number })?.score || 0,
      ragHit: hasRAGHit,
      status: "ok",
    });

    // Save assistant message
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "assistant",
        content: output,
        metadata: structuredResponse.data as object,
        modelUsed: actualModelUsed,
        tokensPrompt,
        tokensCompletion,
        cost,
        latency,
      },
    });

    // Log to LLM audit
    const logData = {
      userId,
      taskType: TASK_MAP[task] as "TRANSLATION" | "REPLY" | "RISK" | "LEARN",
      sceneType: SCENE_MAP[scene] as "GENERAL" | "BUSINESS" | "STAFF" | "COUPLE" | "RESTAURANT" | "RENT" | "HOSPITAL" | "REPAIR",
      modelUsed: actualModelUsed,
      input: sanitizeForLog(input),
      promptLayers: JSON.stringify(promptResult.layers),
      output,
      tokensPrompt,
      tokensCompletion,
      cost,
      latency,
      riskScore: (structuredResponse.data as { score?: number })?.score || 0,
      ragHit: hasRAGHit,
      status: "ok",
      entryHash: "",
    };
    logData.entryHash = computeEntryHash(logData);
    await prisma.llmLog.create({ data: logData });

    // Inject KB hits into risk data if applicable
    if (task === "risk" && structuredResponse.data && kbHits.length > 0) {
      (structuredResponse.data as { knowledgeHits?: KBHit[] }).knowledgeHits = kbHits;
    }

    // Return response
    return NextResponse.json({
      ...structuredResponse,
      proactiveWarnings: proactiveWarnings.length > 0 ? proactiveWarnings : undefined,
      kbHits: kbHits.length > 0 ? kbHits : undefined,
      hasContext: conversationHistory.length > 1,
      conversationId: convId,
      intent: { task, scene, confidence: intent.confidence },
      costWarning: costCheck.warning || downgradeWarning || undefined,
      abGroup: abResult.abGroup || undefined,
      usage: {
        model: actualModelUsed,
        tokensPrompt,
        tokensCompletion,
        cost: cost.toFixed(4),
        latency,
        fallback: llmResult.usedFallback || undefined,
      },
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return NextResponse.json(
      { error: "服务暂时不可用，请稍后再试" },
      { status: 500 }
    );
  }
}

// ============================================================================
// Streaming Response Handler (SSE)
// ============================================================================

interface StreamParams {
  modelName: string;
  messages: Array<{ role: string; content: string }>;
  task: TaskId;
  scene: SceneId;
  tone: number;
  input: string;
  model: { name: string; reason: string; tier: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  promptResult: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conversationHistory: any[];
  userId: string;
  convId: string;
  startTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intent: any;
  kbHits: KBHit[];
  hasRAGHit: boolean;
  costWarning?: string;
  downgradeWarning?: string;
  abGroup?: string;
  fallbackModel?: string;
  maxLatency?: number;
}

function handleStreamingResponse(params: StreamParams): Response {
  const {
    modelName,
    messages,
    task,
    scene,
    tone,
    input,
    model,
    promptResult,
    conversationHistory,
    userId,
    convId,
    startTime,
    intent,
    kbHits,
    hasRAGHit,
    costWarning,
    downgradeWarning,
    abGroup,
    fallbackModel,
    maxLatency,
  } = params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const streamResult = await callLLMStream({
          messages,
          primaryModel: modelName,
          fallbackModel,
          maxLatency,
          temperature: 0.7,
          maxTokens: 2000,
        });

        const actualModelUsed = streamResult.modelUsed;
        const actualProvider = streamResult.provider;
        let fullOutput = "";

        for await (const chunk of streamResult.stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullOutput += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`)
            );
          }
        }

        // Stream complete — process final response
        const tokensPrompt = estimateTokens(messages.map((m) => m.content).join(""));
        const tokensCompletion = estimateTokens(fullOutput);
        const latency = Date.now() - startTime;
        const costPerToken = actualProvider === "openai" ? 0.000005 : 0.000001;
        const cost = (tokensPrompt + tokensCompletion) * costPerToken;

        const proactiveWarnings = checkProactiveWarnings(input, scene, tone);
        const structuredResponse = generateResponse({
          rawOutput: fullOutput,
          task,
          scene,
          tone,
          input,
          modelName: actualModelUsed,
          modelReason: streamResult.usedFallback ? `${model.reason} (fallback)` : model.reason,
        });

        // Inject KB hits into risk data
        if (task === "risk" && structuredResponse.data && kbHits.length > 0) {
          (structuredResponse.data as { knowledgeHits?: KBHit[] }).knowledgeHits = kbHits;
        }

        // Send final structured message
        const { type: msgType, ...restResponse } = structuredResponse;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              messageType: msgType,
              ...restResponse,
              proactiveWarnings: proactiveWarnings.length > 0 ? proactiveWarnings : undefined,
              kbHits: kbHits.length > 0 ? kbHits : undefined,
              hasContext: conversationHistory.length > 1,
              conversationId: convId,
              intent: { task, scene, confidence: intent.confidence },
              costWarning: costWarning || downgradeWarning || undefined,
              abGroup: abGroup || undefined,
              usage: {
                model: actualModelUsed,
                tokensPrompt,
                tokensCompletion,
                cost: cost.toFixed(4),
                latency,
                fallback: streamResult.usedFallback || undefined,
              },
            })}\n\n`
          )
        );

        // Background: persist & log (non-blocking)
        Promise.all([
          logUsage({
            userId,
            taskType: task.toUpperCase(),
            sceneType: scene.toUpperCase(),
            modelUsed: actualModelUsed,
            tokensPrompt,
            tokensCompletion,
            cost,
            latency,
            riskScore: (structuredResponse.data as { score?: number })?.score || 0,
            ragHit: hasRAGHit,
            status: "ok",
          }),
          prisma.message.create({
            data: {
              conversationId: convId,
              role: "assistant",
              content: fullOutput,
              metadata: structuredResponse.data as object,
              modelUsed: actualModelUsed,
              tokensPrompt,
              tokensCompletion,
              cost,
              latency,
            },
          }),
          (() => {
            const streamLogData = {
              userId,
              taskType: TASK_MAP[task] as "TRANSLATION" | "REPLY" | "RISK" | "LEARN",
              sceneType: SCENE_MAP[scene] as "GENERAL" | "BUSINESS" | "STAFF" | "COUPLE" | "RESTAURANT" | "RENT" | "HOSPITAL" | "REPAIR",
              modelUsed: actualModelUsed,
              input: sanitizeForLog(input),
              promptLayers: JSON.stringify(promptResult.layers),
              output: fullOutput,
              tokensPrompt,
              tokensCompletion,
              cost,
              latency,
              riskScore: (structuredResponse.data as { score?: number })?.score || 0,
              ragHit: hasRAGHit,
              status: "ok",
              entryHash: "",
            };
            streamLogData.entryHash = computeEntryHash(streamLogData);
            return prisma.llmLog.create({ data: streamLogData });
          })(),
        ]).catch((err) => console.error("[Chat Persist Error]", err));

        controller.close();
      } catch (error) {
        console.error("[Chat Stream Error]", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: "服务暂时不可用" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
