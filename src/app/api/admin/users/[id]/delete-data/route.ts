// ============================================================================
// VietBridge AI — Admin: Delete User Data
// POST /api/admin/users/:id/delete-data
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { deleteUserData } from "@/lib/user-data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id: targetUserId } = await params;

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const deleteAccount = body.deleteAccount === true;

    const result = await deleteUserData(targetUserId, { deleteAccount });

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      email: targetUser.email,
      deleted: result,
    });
  } catch (error) {
    console.error("[Admin Delete User Data Error]", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
