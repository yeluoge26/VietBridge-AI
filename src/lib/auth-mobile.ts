// ============================================================================
// VietBridge AI V2 — Mobile Auth Helper
// Supports both NextAuth session (web) and Bearer JWT token (mobile)
// ============================================================================

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
}

/**
 * Get authenticated user from either:
 * 1. NextAuth session cookie (web) — checked first
 * 2. Authorization: Bearer <JWT> header (mobile) — fallback
 *
 * Returns null if not authenticated.
 */
export async function getAuthUser(
  req?: NextRequest
): Promise<AuthUser | null> {
  // 1. Try NextAuth session (web browser with cookies)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return {
      id: session.user.id,
      role: session.user.role,
      name: session.user.name,
      email: session.user.email,
    };
  }

  // 2. Fallback: Bearer token (mobile app)
  if (!req) return null;

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
      role: string;
      name?: string;
      email?: string;
    };
    return {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name || null,
      email: decoded.email || null,
    };
  } catch {
    return null;
  }
}

/**
 * Sign a JWT token for mobile auth.
 * Expires in 30 days.
 */
export function signMobileToken(user: {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
}): string {
  const secret = process.env.NEXTAUTH_SECRET!;
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name || undefined,
      email: user.email || undefined,
    },
    secret,
    { expiresIn: "30d" }
  );
}
