// ============================================================================
// VietBridge AI V2 — Usage API
// Returns current usage stats for the authenticated user
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { checkUsageQuota } from "@/lib/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const quota = await checkUsageQuota(session.user.id);

  return NextResponse.json({
    used: quota.used,
    limit: quota.limit,
    allowed: quota.allowed,
    plan: session.user.role === "admin" ? "ENTERPRISE" : "FREE",
  });
}
