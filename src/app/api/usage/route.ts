// ============================================================================
// VietBridge AI V2 — Usage API
// Returns current usage stats for the authenticated user
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { checkUsageQuota } from "@/lib/usage";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const quota = await checkUsageQuota(user.id);

  return NextResponse.json({
    used: quota.used,
    limit: quota.limit,
    allowed: quota.allowed,
    plan: user.role === "admin" ? "ENTERPRISE" : "FREE",
  });
}
