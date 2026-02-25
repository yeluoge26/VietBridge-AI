// ============================================================================
// VietBridge AI V2 — Rate Limiting (Upstash)
// Sliding window: 10 requests per 10 seconds per identifier
// ============================================================================

import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, remaining, reset } = await rateLimiter.limit(identifier);
  return { success, remaining, reset };
}
