// ============================================================================
// VietBridge AI — OCR Result Caching (Redis)
// SHA-256 hash of ocrText+documentType as key, 24h TTL
// ============================================================================

import crypto from "crypto";
import { redis } from "./redis";

const OCR_CACHE_PREFIX = "ocr:cache:";
const OCR_CACHE_TTL = 86400; // 24 hours in seconds

function buildCacheKey(ocrText: string, documentType: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${documentType}:${ocrText}`)
    .digest("hex");
  return `${OCR_CACHE_PREFIX}${hash}`;
}

export interface CachedOcrResult {
  type: string;
  documentType: string;
  data: unknown;
  model: string;
  usage: {
    tokensPrompt: number;
    tokensCompletion: number;
    cost: string;
    latency: number;
  };
}

/**
 * Attempt to retrieve a cached OCR result.
 */
export async function getOcrCache(
  ocrText: string,
  documentType: string
): Promise<CachedOcrResult | null> {
  const key = buildCacheKey(ocrText, documentType);
  const cached = await redis.get<CachedOcrResult>(key);
  return cached;
}

/**
 * Store an OCR result in cache with 24-hour TTL.
 */
export async function setOcrCache(
  ocrText: string,
  documentType: string,
  result: CachedOcrResult
): Promise<void> {
  const key = buildCacheKey(ocrText, documentType);
  await redis.set(key, result, { ex: OCR_CACHE_TTL });
}
