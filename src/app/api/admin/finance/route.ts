// ============================================================================
// VietBridge AI V2 — Admin Finance API
// CRUD for ModelPrice + monthly cost summary per model
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();

    const [prices, monthlyCostRaw] = await Promise.all([
      prisma.modelPrice.findMany({ orderBy: { modelName: "asc" } }),
      prisma.$queryRaw<
        { model: string; calls: bigint; tokens: bigint; cost: number }[]
      >`
        SELECT
          "modelUsed" AS "model",
          COUNT(*) AS "calls",
          COALESCE(SUM("tokensPrompt" + "tokensCompletion"), 0) AS "tokens",
          COALESCE(SUM("cost"), 0)::float AS "cost"
        FROM "UsageLog"
        WHERE "createdAt" >= ${monthStart}
        GROUP BY "modelUsed"
        ORDER BY "cost" DESC
      `,
    ]);

    const monthlyCosts = monthlyCostRaw.map((r) => ({
      model: r.model,
      cost: Number(r.cost),
    }));
    const totalCostThisMonth = monthlyCosts.reduce((s, r) => s + r.cost, 0);
    const totalCalls = monthlyCostRaw.reduce((s, r) => s + Number(r.calls), 0);
    const avgDailyCost = dayOfMonth > 0 ? totalCostThisMonth / dayOfMonth : 0;
    const avgCostPerCall = totalCalls > 0 ? totalCostThisMonth / totalCalls : 0;
    const activeModels = prices.filter((p) => p.active).length;

    // Map DB `active` to frontend `enabled`
    const models = prices.map((p) => ({
      id: p.id,
      modelName: p.modelName,
      displayName: p.displayName,
      provider: p.provider,
      inputPrice: p.inputPrice,
      outputPrice: p.outputPrice,
      enabled: p.active,
    }));

    return NextResponse.json({
      overview: { totalCostThisMonth, avgDailyCost, avgCostPerCall, activeModels },
      models,
      monthlyCosts,
    });
  } catch (err) {
    console.error("[Finance GET]", err);
    return NextResponse.json({ error: "获取财务数据失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const body = await req.json();
    const { modelName, displayName, provider, inputPrice, outputPrice, enabled } = body;

    if (!modelName || typeof modelName !== "string") {
      return NextResponse.json(
        { error: "参数错误", details: ["modelName is required"] },
        { status: 400 }
      );
    }

    const price = await prisma.modelPrice.create({
      data: {
        modelName,
        displayName: displayName || "",
        provider: provider || "",
        inputPrice: inputPrice ?? 0,
        outputPrice: outputPrice ?? 0,
        active: enabled ?? true,
      },
    });

    return NextResponse.json(price, { status: 201 });
  } catch (err) {
    console.error("[Finance POST]", err);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "参数错误", details: ["id is required"] },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (updates.modelName !== undefined) data.modelName = updates.modelName;
    if (updates.displayName !== undefined) data.displayName = updates.displayName;
    if (updates.provider !== undefined) data.provider = updates.provider;
    if (updates.inputPrice !== undefined) data.inputPrice = updates.inputPrice;
    if (updates.outputPrice !== undefined) data.outputPrice = updates.outputPrice;
    if (updates.enabled !== undefined) data.active = updates.enabled;

    const price = await prisma.modelPrice.update({
      where: { id },
      data,
    });

    return NextResponse.json(price);
  } catch (err) {
    console.error("[Finance PUT]", err);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "参数错误", details: ["id is required"] }, { status: 400 });
    }

    await prisma.modelPrice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Finance DELETE]", err);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
