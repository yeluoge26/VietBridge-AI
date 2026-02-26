// ============================================================================
// VietBridge AI V2 — Mobile Token Validation
// GET /api/auth/mobile/me — validate token and return user info
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);

  if (!user) {
    return NextResponse.json(
      { error: "未登录或令牌无效" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}
