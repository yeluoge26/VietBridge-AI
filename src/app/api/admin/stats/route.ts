// ============================================================================
// VietBridge AI V2 — Admin Stats API
// Returns dashboard KPIs and chart data
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

  try {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 86400000);
  const yesterday = new Date(todayStart.getTime() - 86400000);
  const eightDaysAgo = new Date(todayStart.getTime() - 8 * 86400000);

  const [totalUsers, todayLogs, weekLogs, totalCost, d1Cohort, d7Cohort, todayActiveUsers, knowledgeCount, promptCount, riskRuleCount, totalCallsCount, courseCount, newUsersToday, dau7Users, freeSubCount, paidSubCount] = await Promise.all([
    prisma.user.count(),
    prisma.llmLog.count({ where: { createdAt: { gte: todayStart }, deleted: false } }),
    prisma.llmLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, deleted: false },
      select: { createdAt: true, cost: true, taskType: true, modelUsed: true, tokensPrompt: true, tokensCompletion: true, latency: true },
      take: 10000,
    }),
    prisma.llmLog.aggregate({ where: { deleted: false }, _sum: { cost: true } }),
    // D1 cohort: users active yesterday
    prisma.usageLog.findMany({
      where: { createdAt: { gte: yesterday, lt: todayStart } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    // D7 cohort: users active 7 days ago
    prisma.usageLog.findMany({
      where: { createdAt: { gte: eightDaysAgo, lt: sevenDaysAgo } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    // Today's active users
    prisma.usageLog.findMany({
      where: { createdAt: { gte: todayStart } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    // Additional counts for dashboard
    prisma.knowledgeEntry.count(),
    prisma.promptVersion.count(),
    prisma.riskRule.count({ where: { active: true } }),
    prisma.llmLog.count({ where: { deleted: false } }),
    prisma.course.count(),
    // New users registered today
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    // DAU7: distinct users with usageLog in last 7 days
    prisma.usageLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    // Free plan subscriptions
    prisma.subscription.count({ where: { plan: "FREE" } }),
    // Paid plan subscriptions (PRO + API)
    prisma.subscription.count({ where: { plan: { in: ["PRO", "API"] } } }),
  ]);

  // Daily trend
  const dailyMap = new Map<string, { calls: number; cost: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 86400000);
    dailyMap.set(d.toISOString().slice(0, 10), { calls: 0, cost: 0 });
  }
  for (const log of weekLogs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      entry.calls++;
      entry.cost += log.cost;
    }
  }

  // Task distribution
  const taskDist: Record<string, number> = {};
  const modelStats: Record<string, { calls: number; tokens: number; cost: number; latency: number }> = {};
  for (const log of weekLogs) {
    taskDist[log.taskType] = (taskDist[log.taskType] || 0) + 1;
    if (!modelStats[log.modelUsed]) {
      modelStats[log.modelUsed] = { calls: 0, tokens: 0, cost: 0, latency: 0 };
    }
    const m = modelStats[log.modelUsed];
    m.calls++;
    m.tokens += log.tokensPrompt + log.tokensCompletion;
    m.cost += log.cost;
    m.latency += log.latency;
  }

  // Average latency
  for (const model of Object.values(modelStats)) {
    model.latency = model.calls > 0 ? Math.round(model.latency / model.calls) : 0;
  }

  // Retention calculation
  const todayActiveSet = new Set(todayActiveUsers.map((u) => u.userId));
  const d1CohortSize = d1Cohort.length;
  const d1Retained = d1Cohort.filter((u) => todayActiveSet.has(u.userId)).length;
  const d7CohortSize = d7Cohort.length;
  const d7Retained = d7Cohort.filter((u) => todayActiveSet.has(u.userId)).length;

  return NextResponse.json({
    kpis: {
      totalUsers,
      todayCalls: todayLogs,
      weekCalls: weekLogs.length,
      totalCost: totalCost._sum.cost || 0,
      knowledgeCount,
      promptCount,
      riskRuleCount,
      totalCalls: totalCallsCount,
      courseCount,
      newUsersToday,
      dau7: dau7Users.length,
      freeUsers: freeSubCount,
      paidUsers: paidSubCount,
    },
    dailyTrend: Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data })),
    taskDistribution: Object.entries(taskDist).map(([task, count]) => ({ task, count })),
    modelStats: Object.entries(modelStats).map(([model, data]) => ({ model, ...data })),
    retention: {
      d1: {
        rate: d1CohortSize > 0 ? Math.round((d1Retained / d1CohortSize) * 100) / 100 : 0,
        cohortSize: d1CohortSize,
        retained: d1Retained,
      },
      d7: {
        rate: d7CohortSize > 0 ? Math.round((d7Retained / d7CohortSize) * 100) / 100 : 0,
        cohortSize: d7CohortSize,
        retained: d7Retained,
      },
    },
  });
  } catch (err) {
    console.error("[Stats GET]", err);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}
