// ============================================================================
// VietBridge AI — API Key Authentication
// Extracts Bearer vb_sk_... from Authorization header, validates against DB
// Returns null if no API key present (fallback to session auth)
// ============================================================================

import { NextRequest } from "next/server";
import { lookupApiKey, incrementApiKeyCalls } from "./api-keys";

export interface ApiKeyAuthResult {
  authenticated: boolean;
  userId?: string;
  userRole?: string;
  apiKeyId?: string;
  apiKeyPrefix?: string;
  error?: string;
}

/**
 * Attempt to authenticate via API key from Authorization header.
 * Returns null if no API key header is present (fallback to session auth).
 * Returns ApiKeyAuthResult if a key is present (whether valid or not).
 */
export async function authenticateApiKey(
  req: NextRequest
): Promise<ApiKeyAuthResult | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(vb_sk_.+)$/);
  if (!match) return null;

  const fullKey = match[1];

  const apiKey = await lookupApiKey(fullKey);
  if (!apiKey) {
    return { authenticated: false, error: "API密钥无效" };
  }
  if (!apiKey.active) {
    return { authenticated: false, error: "API密钥已停用" };
  }

  // Increment call counter (fire-and-forget)
  incrementApiKeyCalls(apiKey.id).catch((err) =>
    console.error("[API Key Counter Error]", err)
  );

  return {
    authenticated: true,
    userId: apiKey.userId,
    userRole: apiKey.user.role,
    apiKeyId: apiKey.id,
    apiKeyPrefix: apiKey.prefix,
  };
}
