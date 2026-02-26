// ============================================================================
// VietBridge AI — Audit Log Hash (Tamper Detection)
// Computes SHA-256 hash for LlmLog entries to detect unauthorized modification.
// ============================================================================

import { createHash } from "crypto";

/** Fields included in the hash computation (order matters). */
const HASH_FIELDS = [
  "userId",
  "taskType",
  "sceneType",
  "modelUsed",
  "input",
  "output",
  "tokensPrompt",
  "tokensCompletion",
  "cost",
  "latency",
  "riskScore",
  "status",
] as const;

/**
 * Compute a SHA-256 hash over the core fields of an LlmLog entry.
 * The hash covers immutable business data so any tampering can be detected.
 */
export function computeEntryHash(
  fields: Record<string, unknown>
): string {
  const payload: Record<string, unknown> = {};
  for (const key of HASH_FIELDS) {
    payload[key] = fields[key] ?? null;
  }
  const json = JSON.stringify(payload);
  return createHash("sha256").update(json).digest("hex");
}
