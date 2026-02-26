// ============================================================================
// VietBridge AI V2 — OCR Document Analysis API
// Analyzes OCR-extracted text from menus, receipts, contracts
// Features: Dual auth (Session + API Key + Guest), rate limit, cost limit, caching
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { ocrSchema } from "@/lib/validators/ocr";
import { checkRateLimit, checkApiKeyRateLimit } from "@/lib/rate-limit";
import { checkUsageQuota, logUsage } from "@/lib/usage";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { getGuestId } from "@/lib/guest-id";
import { checkGuestQuota, incrementGuestUsage } from "@/lib/guest-usage";
import { checkMonthlyCostLimit, checkGlobalCostLimit } from "@/lib/cost-limit";
import { getOcrCache, setOcrCache, type CachedOcrResult } from "@/lib/ocr-cache";
import { estimateTokens } from "@/lib/token-estimator";
import { callLLM } from "@/lib/llm/llm-call";
import { lookupModelRoute } from "@/lib/llm/route-lookup";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // ── 1. Auth (API Key, Mobile Bearer, Session, or Guest) ─────────
    let userId: string;
    let userRole: string;
    let isGuest = false;
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
      const authUser = await getAuthUser(req);
      if (authUser?.id) {
        userId = authUser.id;
        userRole = authUser.role;
      } else {
        const guestId = getGuestId(req);
        if (!guestId) {
          return NextResponse.json({ error: "未登录" }, { status: 401 });
        }
        userId = guestId;
        userRole = "guest";
        isGuest = true;
      }
    }

    // ── 2. Validate ───────────────────────────────────────────────────
    const body = await req.json();
    const parsed = ocrSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "参数错误" },
        { status: 400 }
      );
    }

    const { ocrText, documentType } = parsed.data;

    // ── 3. Rate limit (API Key vs Session/Guest) ────────────────────
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
        return NextResponse.json({ error: "请求太频繁" }, { status: 429 });
      }
    }

    // ── 4. Quota check ────────────────────────────────────────────────
    if (isGuest) {
      const guestQuota = await checkGuestQuota(userId);
      if (!guestQuota.allowed) {
        return NextResponse.json(
          { error: "今日额度已用完，注册后可获得更多额度", upgrade: true },
          { status: 403 }
        );
      }
    } else {
      const quota = await checkUsageQuota(userId);
      if (!quota.allowed) {
        return NextResponse.json(
          { error: "今日额度已用完", upgrade: true },
          { status: 403 }
        );
      }
    }

    // ── 4b. Monthly cost limit (skip for guests) ────────────────────
    let costCheck: { allowed: boolean; warning?: string; shouldDowngrade: boolean; upgradeMessage?: string } = { allowed: true, shouldDowngrade: false };
    if (!isGuest) {
      const globalCost = await checkGlobalCostLimit();
      if (!globalCost.allowed) {
        return NextResponse.json(
          { error: globalCost.message },
          { status: 503 }
        );
      }
      const cc = await checkMonthlyCostLimit(userId);
      if (!cc.allowed) {
        return NextResponse.json(
          { error: cc.upgradeMessage, upgrade: true },
          { status: 403 }
        );
      }
      costCheck = cc;
    }

    // ── 5. Cache check ────────────────────────────────────────────────
    const cached = await getOcrCache(ocrText, documentType);
    if (cached) {
      if (isGuest) {
        await incrementGuestUsage(userId);
      } else {
        await logUsage({
          userId,
          taskType: "SCAN",
          sceneType: documentType === "menu" ? "RESTAURANT" : "GENERAL",
          modelUsed: cached.model + " (cached)",
          tokensPrompt: 0,
          tokensCompletion: 0,
          cost: 0,
          latency: Date.now() - startTime,
          status: "ok",
        });
      }

      return NextResponse.json({
        ...cached,
        cached: true,
        costWarning: costCheck.warning || undefined,
        usage: {
          ...cached.usage,
          latency: Date.now() - startTime,
          cached: true,
        },
      });
    }

    // ── 6. LLM call ──────────────────────────────────────────────────
    const typeLabel =
      documentType === "menu"
        ? "菜单"
        : documentType === "receipt"
          ? "收据"
          : "合同";
    const systemPrompt = `You are VietBridge AI document analyzer. Analyze this ${typeLabel} OCR text.
Output JSON with:
- items: array of { name_vi, name_zh, price, unit, priceReasonable (boolean), note }
- summary_zh: Chinese summary
- totalEstimate: estimated total cost
- warnings: array of risk/hidden cost warnings in Chinese
- tips: array of cultural tips in Chinese

For menus: compare prices to Da Nang averages.
For receipts: check for hidden charges.
For contracts: identify risky clauses.`;

    let isPro = !isGuest && (userRole === "pro" || userRole === "admin");
    if (costCheck.shouldDowngrade && isPro) {
      isPro = false;
    }
    const modelName = isPro ? "gpt-4o" : "qwen-plus";

    // Route config for fallback + cost limit
    const routeConfig = await lookupModelRoute("SCAN",
      documentType === "menu" ? "RESTAURANT" : "GENERAL");

    // Single-request cost pre-check
    const ocrMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: ocrText },
    ];
    if (routeConfig?.maxCost) {
      const provider = isPro ? "openai" : "qwen";
      const costPerToken = provider === "openai" ? 0.000005 : 0.000001;
      const estCost = estimateTokens(systemPrompt + ocrText) * costPerToken;
      if (estCost > routeConfig.maxCost) {
        return NextResponse.json(
          { error: "文档过长，预估成本超过单次限额" },
          { status: 403 }
        );
      }
    }

    const llmResult = await callLLM({
      messages: ocrMessages,
      primaryModel: modelName,
      fallbackModel: routeConfig?.fallbackModel,
      maxLatency: routeConfig?.maxLatency,
      temperature: 0.3,
      maxTokens: 2000,
    });

    const output = llmResult.output;
    const actualModelUsed = llmResult.modelUsed;
    const tokensPrompt = llmResult.tokensPrompt;
    const tokensCompletion = llmResult.tokensCompletion;
    const latency = Date.now() - startTime;
    const actualProvider = llmResult.provider;
    const cost =
      (tokensPrompt + tokensCompletion) * (actualProvider === "openai" ? 0.000005 : 0.000001);

    if (isGuest) {
      await incrementGuestUsage(userId);
    } else {
      await logUsage({
        userId,
        taskType: "SCAN",
        sceneType: documentType === "menu" ? "RESTAURANT" : "GENERAL",
        modelUsed: actualModelUsed,
        tokensPrompt,
        tokensCompletion,
        cost,
        latency,
        status: "ok",
      });
    }

    let data;
    try {
      data = JSON.parse(output);
    } catch {
      data = { raw: output };
    }

    // ── 7. Cache result (fire-and-forget) ────────────────────────────
    const responsePayload: CachedOcrResult = {
      type: "document_analysis",
      documentType,
      data,
      model: actualModelUsed,
      usage: {
        tokensPrompt,
        tokensCompletion,
        cost: cost.toFixed(4),
        latency,
      },
    };

    setOcrCache(ocrText, documentType, responsePayload).catch((err) =>
      console.error("[OCR Cache Set Error]", err)
    );

    return NextResponse.json({
      ...responsePayload,
      cached: false,
      costWarning: costCheck.warning || undefined,
    });
  } catch (error) {
    console.error("[OCR Analyze Error]", error);
    return NextResponse.json({ error: "分析失败" }, { status: 500 });
  }
}
