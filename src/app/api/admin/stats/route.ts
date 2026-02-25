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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 86400000);

  const [totalUsers, todayLogs, weekLogs, totalCost] = await Promise.all([
    prisma.user.count(),
    prisma.llmLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.llmLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, cost: true, taskType: true, modelUsed: true, tokensPrompt: true, tokensCompletion: true, latency: true },
    }),
    prisma.llmLog.aggregate({ _sum: { cost: true } }),
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

  return NextResponse.json({
    kpis: {
      totalUsers,
      todayCalls: todayLogs,
      weekCalls: weekLogs.length,
      totalCost: totalCost._sum.cost || 0,
    },
    dailyTrend: Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data })),
    taskDistribution: Object.entries(taskDist).map(([task, count]) => ({ task, count })),
    modelStats: Object.entries(modelStats).map(([model, data]) => ({ model, ...data })),
  });
}
