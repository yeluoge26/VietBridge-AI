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

  const [totalUsers, subscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
  ]);

  const planBreakdown = subscriptions.map((s) => ({
    plan: s.plan,
    count: s._count.plan,
  }));

  const paidUsers = planBreakdown
    .filter((p) => p.plan !== "FREE")
    .reduce((sum, p) => sum + p.count, 0);

  const freeUsers = planBreakdown
    .filter((p) => p.plan === "FREE")
    .reduce((sum, p) => sum + p.count, 0);

  return NextResponse.json({
    totalUsers,
    paidUsers,
    freeUsers,
    planBreakdown,
  });
}
