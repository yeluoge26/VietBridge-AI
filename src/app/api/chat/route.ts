// ============================================================================
// VietBridge AI V2 — Unified Chat API Endpoint
// Handles all 4 tasks: translate, reply, risk, learn
// Pipeline: Auth → Validate → Rate-limit → Quota → Intent → Model → LLM → Log
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { chatSchema } from "@/lib/validators/chat";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkUsageQuota, logUsage } from "@/lib/usage";
import { detectIntent } from "@/lib/llm/intent-detector";
import { selectModel } from "@/lib/llm/model-router";
import { buildPrompt } from "@/lib/llm/prompt-builder";
import { getClient } from "@/lib/llm/client";
import { checkProactiveWarnings } from "@/lib/intelligence/proactive";
import { estimateTokens } from "@/lib/token-estimator";
import type { TaskId } from "@/lib/intelligence/tasks";
import type { SceneId } from "@/lib/intelligence/scene-rules";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // ── 1. Auth ────────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const userId = session.user.id;

    // ── 2. Validate ────────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "参数错误" },
        { status: 400 }
      );
    }
    const { input, tone, langDir, conversationHistory } = parsed.data;

    // ── 3. Rate limit ──────────────────────────────────────────────────────
    const rateResult = await checkRateLimit(userId);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "请求太频繁，请稍后再试", remaining: rateResult.remaining },
        { status: 429 }
      );
    }

    // ── 4. Quota check ─────────────────────────────────────────────────────
    const quota = await checkUsageQuota(userId);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: "今日额度已用完", used: quota.used, limit: quota.limit, upgrade: true },
        { status: 403 }
      );
    }

    // ── 5. Intent detection ────────────────────────────────────────────────
    const intent = detectIntent(input);
    const task: TaskId = (parsed.data.task || intent.task) as TaskId;
    const scene: SceneId = (parsed.data.scene || intent.scene || "general") as SceneId;

    // ── 6. Model routing ───────────────────────────────────────────────────
    const isPro = session.user.role === "pro" || session.user.role === "admin";
    const model = selectModel({ task, scene, input, isPro });

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
    });

    // ── 8. Call LLM ────────────────────────────────────────────────────────
    const fullPrompt = Object.values(promptResult.layers)
      .map((l) => l.content)
      .join("\n\n");

    const provider = model.tier === "pro" ? "openai" : "qwen";
    const client = getClient(provider);
    const modelName =
      provider === "openai" ? "gpt-4o" : "qwen-plus";

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: fullPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const output = completion.choices[0]?.message?.content || "";
    const tokensPrompt = completion.usage?.prompt_tokens || estimateTokens(fullPrompt + input);
    const tokensCompletion = completion.usage?.completion_tokens || estimateTokens(output);

    // ── 9. Proactive warnings ──────────────────────────────────────────────
    const proactiveWarnings = checkProactiveWarnings(input, scene, tone);

    // ── 10. Parse response ─────────────────────────────────────────────────
    let responseData;
    try {
      responseData = JSON.parse(output);
    } catch {
      // If LLM didn't return JSON, wrap it
      responseData = { raw: output };
    }

    const latency = Date.now() - startTime;
    const costPerToken = provider === "openai" ? 0.000005 : 0.000001;
    const cost = (tokensPrompt + tokensCompletion) * costPerToken;

    // ── 11. Log usage ──────────────────────────────────────────────────────
    await logUsage({
      userId,
      taskType: task.toUpperCase(),
      sceneType: scene.toUpperCase(),
      modelUsed: model.name,
      tokensPrompt,
      tokensCompletion,
      cost,
      latency,
      riskScore: responseData?.score || 0,
      ragHit: !!responseData?.knowledgeHits?.length,
      status: "ok",
    });

    // ── 12. Return response ────────────────────────────────────────────────
    return NextResponse.json({
      type: task === "translate" ? "translation"
        : task === "reply" ? "reply"
        : task === "risk" ? "risk"
        : "teaching",
      data: responseData,
      prompt: {
        layers: promptResult.layers,
        model: { name: model.name, reason: model.reason },
      },
      proactiveWarnings,
      hasContext: conversationHistory.length > 1,
      intent: { task, scene, confidence: intent.confidence },
      usage: {
        model: model.name,
        tokensPrompt,
        tokensCompletion,
        cost: cost.toFixed(4),
        latency,
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
