// ============================================================================
// VietBridge AI V2 — Usage API
// Returns current usage stats for authenticated user or guest
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { getGuestId } from "@/lib/guest-id";
import { checkUsageQuota } from "@/lib/usage";
import { getGuestUsage } from "@/lib/guest-usage";

export async function GET(req: NextRequest) {
  // Try authenticated user first
  const user = await getAuthUser(req);
  if (user?.id) {
    const quota = await checkUsageQuota(user.id);
    return NextResponse.json({
      used: quota.used,
      limit: quota.limit,
      allowed: quota.allowed,
      plan: user.role === "admin" ? "PRO" : "FREE",
    });
  }

  // Try guest
  const guestId = getGuestId(req);
  if (guestId) {
    const usage = await getGuestUsage(guestId);
    return NextResponse.json({
      used: usage.used,
      limit: usage.limit,
      allowed: usage.allowed,
      plan: "GUEST",
    });
  }

  return NextResponse.json({ error: "未登录" }, { status: 401 });
}
