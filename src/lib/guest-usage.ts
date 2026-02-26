// ============================================================================
// VietBridge AI V2 — Guest Usage Tracking (Redis)
// Tracks guest daily quota via Redis counters (no DB writes)
// ============================================================================

import { redis } from "./redis";

const GUEST_DAILY_LIMIT = 10;
const DAILY_TTL = 48 * 60 * 60; // 48 hours

function dailyKey(guestId: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `vb:guest_quota:${guestId}:${date}`;
}

/**
 * Check if guest has remaining daily quota.
 */
export async function checkGuestQuota(
  guestId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  try {
    const key = dailyKey(guestId);
    const used = (await redis.get<number>(key)) ?? 0;
    return {
      allowed: used < GUEST_DAILY_LIMIT,
      used,
      limit: GUEST_DAILY_LIMIT,
    };
  } catch {
    // Redis unavailable — allow request
    return { allowed: true, used: 0, limit: GUEST_DAILY_LIMIT };
  }
}

/**
 * Increment guest daily usage counter.
 */
export async function incrementGuestUsage(guestId: string): Promise<void> {
  try {
    const key = dailyKey(guestId);
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, DAILY_TTL);
    await pipeline.exec();
  } catch {
    // Redis unavailable — skip increment
  }
}

/**
 * Get guest usage stats (for /api/usage endpoint).
 */
export async function getGuestUsage(
  guestId: string
): Promise<{ used: number; limit: number; allowed: boolean }> {
  try {
    return await checkGuestQuota(guestId);
  } catch {
    return { used: 0, limit: GUEST_DAILY_LIMIT, allowed: true };
  }
}
