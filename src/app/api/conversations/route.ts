// ============================================================================
// VietBridge AI V2 — Conversations List API
// GET /api/conversations — list user's conversations
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      conversations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[Conversations Error]", error);
    return NextResponse.json(
      { error: "获取对话列表失败" },
      { status: 500 }
    );
  }
}
