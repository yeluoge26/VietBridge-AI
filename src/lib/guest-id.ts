// ============================================================================
// VietBridge AI V2 — Guest ID Extraction & Validation
// Extracts guest UUID from X-Guest-Id header, validates format
// ============================================================================

import { NextRequest } from "next/server";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Extract and validate guest ID from request headers.
 * Returns prefixed guest ID ("guest_{uuid}") or null if invalid/absent.
 */
export function getGuestId(req: NextRequest): string | null {
  const raw = req.headers.get("x-guest-id");
  if (!raw || !UUID_V4_REGEX.test(raw)) return null;
  return `guest_${raw}`;
}
