// ============================================================================
// VietBridge AI — Monthly Cost Limit Enforcement
// Per-user limits by plan + optional global system-wide limit
// ============================================================================

import { prisma } from "./prisma";

// Monthly cost limits per plan (USD)
const MONTHLY_COST_LIMITS: Record<string, number> = {
  FREE: 1,
  PRO: 50,
  ENTERPRISE: 500,
  API: 1000,
};

const WARNING_THRESHOLD = 0.8; // 80%

export interface CostCheckResult {
  allowed: boolean;
  currentCost: number;
  limit: number;
  percentUsed: number;
  warning?: string;
  upgradeMessage?: string;
  shouldDowngrade: boolean;
}

/**
 * Check monthly cost limit for a user.
 * Queries UsageLog for the current calendar month.
 */
export async function checkMonthlyCostLimit(
  userId: string
): Promise<CostCheckResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });
  const plan = subscription?.plan ?? "FREE";
  const limit = MONTHLY_COST_LIMITS[plan] ?? MONTHLY_COST_LIMITS.FREE;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await prisma.usageLog.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      status: "ok",
    },
    _sum: { cost: true },
  });

  const currentCost = result._sum.cost ?? 0;
  const percentUsed = limit > 0 ? currentCost / limit : 0;

  if (currentCost >= limit) {
    return {
      allowed: false,
      currentCost,
      limit,
      percentUsed,
      shouldDowngrade: true,
      upgradeMessage: `本月费用已达上限 ($${limit})。请升级套餐以继续使用。`,
    };
  }

  const shouldDowngrade = percentUsed >= 0.9;
  const warning =
    percentUsed >= WARNING_THRESHOLD
      ? `本月费用已使用 ${Math.round(percentUsed * 100)}%（$${currentCost.toFixed(2)} / $${limit}），请注意用量。`
      : undefined;

  return { allowed: true, currentCost, limit, percentUsed, warning, shouldDowngrade };
}

/**
 * Check global system-wide monthly cost limit.
 * Uses GLOBAL_MONTHLY_COST_LIMIT env var (optional).
 */
export async function checkGlobalCostLimit(): Promise<{
  allowed: boolean;
  message?: string;
}> {
  const globalLimitStr = process.env.GLOBAL_MONTHLY_COST_LIMIT;
  if (!globalLimitStr) return { allowed: true };

  const globalLimit = parseFloat(globalLimitStr);
  if (isNaN(globalLimit) || globalLimit <= 0) return { allowed: true };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await prisma.usageLog.aggregate({
    where: {
      createdAt: { gte: startOfMonth },
      status: "ok",
    },
    _sum: { cost: true },
  });

  const totalCost = result._sum.cost ?? 0;
  if (totalCost >= globalLimit) {
    return {
      allowed: false,
      message: "系统本月总费用已达上限，服务暂停。请联系管理员。",
    };
  }
  return { allowed: true };
}
