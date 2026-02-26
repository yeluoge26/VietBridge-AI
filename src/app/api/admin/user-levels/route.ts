// ============================================================================
// VietBridge AI V2 — Admin User Levels API
// GET: user count distribution by level (1-6)
// POST: batch recalculate all users' levels from usageLog counts
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/user-level";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const distribution = await prisma.user.groupBy({
    by: ["userLevel"],
    _count: { userLevel: true },
    orderBy: { userLevel: "asc" },
  });

  // Ensure all levels 1-6 are represented
  const levelMap = new Map<number, number>();
  for (let i = 1; i <= 6; i++) {
    levelMap.set(i, 0);
  }
  for (const row of distribution) {
    levelMap.set(row.userLevel, row._count.userLevel);
  }

  const levels = Array.from(levelMap.entries()).map(([level, count]) => ({
    level,
    count,
  }));

  return NextResponse.json({ levels });
}

export async function POST() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  // Count usageLogs per user
  const usageCounts = await prisma.usageLog.groupBy({
    by: ["userId"],
    _count: { userId: true },
  });

  let updated = 0;

  // Batch update each user's totalCalls and recalculate level
  for (const entry of usageCounts) {
    const totalCalls = entry._count.userId;
    const newLevel = calculateLevel(totalCalls);

    await prisma.user.update({
      where: { id: entry.userId },
      data: {
        totalCalls,
        userLevel: newLevel,
      },
    });
    updated++;
  }

  // Users with zero usage logs get reset to level 1
  await prisma.user.updateMany({
    where: {
      id: { notIn: usageCounts.map((e) => e.userId) },
    },
    data: {
      totalCalls: 0,
      userLevel: 1,
    },
  });

  return NextResponse.json({
    message: "用户等级已重新计算",
    usersUpdated: updated,
    usersReset: await prisma.user.count() - updated,
  });
}
