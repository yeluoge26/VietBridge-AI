// ============================================================================
// VietBridge AI V2 — Rate Limiting (Upstash)
// Session: 10 req/10s | API Key: 60 req/60s
// ============================================================================

import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Session-based user rate limit
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "rl:session",
});

// API key rate limit: 60 requests per 60 seconds
export const apiKeyRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  prefix: "rl:apikey",
});

export async function checkRateLimit(identifier: string) {
  try {
    const { success, remaining, reset } = await rateLimiter.limit(identifier);
    return { success, remaining, reset };
  } catch {
    // Redis unavailable — allow request (graceful degradation)
    return { success: true, remaining: 999, reset: 0 };
  }
}

export async function checkApiKeyRateLimit(apiKeyPrefix: string) {
  try {
    const { success, remaining, reset } =
      await apiKeyRateLimiter.limit(apiKeyPrefix);
    return { success, remaining, reset };
  } catch {
    return { success: true, remaining: 999, reset: 0 };
  }
}
