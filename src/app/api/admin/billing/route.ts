// ============================================================================
// VietBridge AI V2 — Admin Billing API
// Returns billing overview: user counts by plan, revenue stats
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  // Current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, subscriptions, modelUsageByPlanRaw] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
    // Model usage grouped by plan and model for the current month
    prisma.$queryRaw<
      { plan: string; model: string; calls: number; tokens: number; cost: number }[]
    >`
      SELECT
        COALESCE(s."plan", 'FREE') AS "plan",
        u."modelUsed" AS "model",
        COUNT(*)::int AS "calls",
        SUM(u."tokensPrompt" + u."tokensCompletion")::int AS "tokens",
        SUM(u."cost")::float AS "cost"
      FROM "UsageLog" u
      LEFT JOIN "Subscription" s ON s."userId" = u."userId"
      WHERE u."createdAt" >= ${monthStart}
      GROUP BY COALESCE(s."plan", 'FREE'), u."modelUsed"
      ORDER BY "plan", "model"
    `,
  ]);

  const planBreakdown = subscriptions.map((s) => ({
    plan: s.plan,
    count: s._count.plan,
  }));

  const paidUsers = planBreakdown
    .filter((p) => p.plan !== "FREE")
    .reduce((sum, p) => sum + p.count, 0);

  // Users without any subscription record are also free users
  const freeUsers = totalUsers - paidUsers;

  // Ensure FREE count in planBreakdown includes users without subscription records
  const adjustedBreakdown = planBreakdown.filter((p) => p.plan !== "FREE");
  adjustedBreakdown.push({ plan: "FREE", count: freeUsers });

  return NextResponse.json({
    totalUsers,
    paidUsers,
    freeUsers,
    planBreakdown: adjustedBreakdown,
    modelUsageByPlan: modelUsageByPlanRaw,
  });
}
