// ============================================================================
// VietBridge AI V2 — Usage Tracking & Quota Enforcement
// Free: 50/day, Pro: 999/day, Enterprise: 9999/day, API: unlimited
// ============================================================================

import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Plan Limits (requests per day)
// ---------------------------------------------------------------------------

const PLAN_LIMITS: Record<string, number> = {
  FREE: 50,
  PRO: 999,
  ENTERPRISE: 9999,
  API: Infinity,
};

// ---------------------------------------------------------------------------
// Check Usage Quota
// ---------------------------------------------------------------------------

export async function checkUsageQuota(
  userId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  // Get user's subscription plan
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });

  const plan = subscription?.plan ?? "FREE";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

  // Unlimited plans always pass
  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: -1 };
  }

  // Count today's usage
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const used = await prisma.usageLog.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
      status: "ok",
    },
  });

  return {
    allowed: used < limit,
    used,
    limit,
  };
}

// ---------------------------------------------------------------------------
// Log Usage
// ---------------------------------------------------------------------------

export async function logUsage(params: {
  userId: string;
  taskType: string;
  sceneType: string;
  modelUsed: string;
  tokensPrompt: number;
  tokensCompletion: number;
  cost: number;
  latency: number;
  riskScore?: number;
  ragHit?: boolean;
  status?: string;
}): Promise<void> {
  await prisma.usageLog.create({
    data: {
      userId: params.userId,
      taskType: params.taskType as "TRANSLATION" | "REPLY" | "RISK" | "LEARN" | "SCAN",
      sceneType: (params.sceneType?.toUpperCase() ?? "GENERAL") as
        | "GENERAL"
        | "BUSINESS"
        | "STAFF"
        | "COUPLE"
        | "RESTAURANT"
        | "RENT"
        | "HOSPITAL"
        | "REPAIR",
      modelUsed: params.modelUsed,
      tokensPrompt: params.tokensPrompt,
      tokensCompletion: params.tokensCompletion,
      cost: params.cost,
      latency: params.latency,
      riskScore: params.riskScore ?? null,
      ragHit: params.ragHit ?? false,
      status: params.status ?? "ok",
    },
  });
}
