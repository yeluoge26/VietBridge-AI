// ============================================================================
// VietBridge AI V2 — OCR Document Analysis API
// Analyzes OCR-extracted text from menus, receipts, contracts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ocrSchema } from "@/lib/validators/ocr";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkUsageQuota, logUsage } from "@/lib/usage";
import { getClient } from "@/lib/llm/client";
import { estimateTokens } from "@/lib/token-estimator";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ocrSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "参数错误" },
        { status: 400 }
      );
    }

    const { ocrText, documentType } = parsed.data;

    const rateResult = await checkRateLimit(session.user.id);
    if (!rateResult.success) {
      return NextResponse.json({ error: "请求太频繁" }, { status: 429 });
    }

    const quota = await checkUsageQuota(session.user.id);
    if (!quota.allowed) {
      return NextResponse.json({ error: "今日额度已用完", upgrade: true }, { status: 403 });
    }

    const typeLabel = documentType === "menu" ? "菜单" : documentType === "receipt" ? "收据" : "合同";
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

    const isPro = session.user.role === "pro" || session.user.role === "admin";
    const client = getClient(isPro ? "openai" : "qwen");
    const modelName = isPro ? "gpt-4o" : "qwen-plus";

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: ocrText },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const output = completion.choices[0]?.message?.content || "";
    const tokensPrompt = completion.usage?.prompt_tokens || estimateTokens(systemPrompt + ocrText);
    const tokensCompletion = completion.usage?.completion_tokens || estimateTokens(output);
    const latency = Date.now() - startTime;
    const cost = (tokensPrompt + tokensCompletion) * (isPro ? 0.000005 : 0.000001);

    await logUsage({
      userId: session.user.id,
      taskType: "SCAN",
      sceneType: documentType === "menu" ? "RESTAURANT" : "GENERAL",
      modelUsed: modelName,
      tokensPrompt,
      tokensCompletion,
      cost,
      latency,
      status: "ok",
    });

    let data;
    try {
      data = JSON.parse(output);
    } catch {
      data = { raw: output };
    }

    return NextResponse.json({
      type: "document_analysis",
      documentType,
      data,
      model: modelName,
      usage: { tokensPrompt, tokensCompletion, cost: cost.toFixed(4), latency },
    });
  } catch (error) {
    console.error("[OCR Analyze Error]", error);
    return NextResponse.json({ error: "分析失败" }, { status: 500 });
  }
}
