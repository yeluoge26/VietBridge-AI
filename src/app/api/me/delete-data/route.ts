// ============================================================================
// VietBridge AI — Self-Service: Delete My Data
// POST /api/me/delete-data
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { deleteUserData } from "@/lib/user-data";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const deleteAccount = body.deleteAccount === true;

    const result = await deleteUserData(session.user.id, { deleteAccount });

    return NextResponse.json({
      success: true,
      deleted: result,
      message: deleteAccount
        ? "账号及所有数据已删除。"
        : "所有使用数据已删除，账号保留。",
    });
  } catch (error) {
    console.error("[Delete My Data Error]", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
