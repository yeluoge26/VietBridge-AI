// ============================================================================
// VietBridge AI — API Key Generation, Hashing & Lookup
// Keys: vb_sk_{32 hex}, stored as SHA-256 hash
// ============================================================================

import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Generate a new API key with format: vb_sk_{32 hex chars}
 * Returns the full key (shown once), its SHA-256 hash (stored), and prefix.
 */
export function generateApiKey(): {
  fullKey: string;
  keyHash: string;
  prefix: string;
} {
  const randomPart = crypto.randomBytes(16).toString("hex");
  const fullKey = `vb_sk_${randomPart}`;
  const keyHash = hashApiKey(fullKey);
  const prefix = fullKey.substring(0, 14); // "vb_sk_" + 8 hex
  return { fullKey, keyHash, prefix };
}

/**
 * Hash an API key with SHA-256 for storage/lookup.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Look up an API key by its full key value.
 * Returns the ApiKey record with user info if found.
 */
export async function lookupApiKey(fullKey: string) {
  const keyHash = hashApiKey(fullKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      userId: true,
      name: true,
      prefix: true,
      active: true,
      calls: true,
      user: { select: { id: true, role: true, email: true, name: true } },
    },
  });
  return apiKey;
}

/**
 * Increment the calls counter on an API key.
 */
export async function incrementApiKeyCalls(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { calls: { increment: 1 } },
  });
}
