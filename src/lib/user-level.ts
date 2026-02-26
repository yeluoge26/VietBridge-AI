// ============================================================================
// VietBridge AI — User Level System
// 6 levels based on cumulative API calls (every 1M calls = 1 level)
// ============================================================================

import { prisma } from "./prisma";

/**
 * Calculate user level from total calls.
 * L1: 0–999,999 | L2: 1M–1,999,999 | ... | L6: 5M+
 */
export function calculateLevel(totalCalls: number): number {
  if (totalCalls >= 5_000_000) return 6;
  return Math.min(6, Math.floor(totalCalls / 1_000_000) + 1);
}

/**
 * Increment user's totalCalls and recalculate userLevel.
 * Called after each successful API usage.
 */
export async function updateUserLevel(userId: string): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { totalCalls: { increment: 1 } },
    select: { totalCalls: true },
  });
  const newLevel = calculateLevel(user.totalCalls);
  await prisma.user.update({
    where: { id: userId },
    data: { userLevel: newLevel },
  });
}
