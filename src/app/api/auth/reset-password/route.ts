// ============================================================================
// VietBridge AI V2 — Reset Password API
// POST /api/auth/reset-password — validates token and sets new password
// ============================================================================

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1, "缺少令牌"),
  password: z.string().min(6, "密码至少6个字符"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "输入无效" },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Find valid reset token
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || !record.identifier.startsWith("reset:")) {
      return NextResponse.json(
        { error: "重置链接无效" },
        { status: 400 }
      );
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "重置链接已过期，请重新申请" },
        { status: 400 }
      );
    }

    // Extract email from identifier (format: "reset:email@example.com")
    const email = record.identifier.replace("reset:", "");

    // Update password and delete token
    const hashedPassword = await hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "密码已重置，请使用新密码登录",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "重置失败，请重试" },
      { status: 500 }
    );
  }
}
