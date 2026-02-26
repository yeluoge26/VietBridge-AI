// ============================================================================
// VietBridge AI V2 — Forgot Password API
// POST /api/auth/forgot-password — sends password reset email
// ============================================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const schema = z.object({
  email: z.string().email("请输入有效邮箱"),
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

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.hashedPassword) {
      // Only send reset for credential-based accounts
      // Delete old reset tokens for this email
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: `reset:${email}`,
        },
      });

      // Create reset token (1h expiry)
      const token = randomBytes(32).toString("hex");
      await prisma.verificationToken.create({
        data: {
          identifier: `reset:${email}`,
          token,
          expires: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await sendPasswordResetEmail(email, token);
    }

    // Always return success (anti-enumeration)
    return NextResponse.json({
      success: true,
      message: "如果该邮箱已注册，您将收到一封重置密码的邮件",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "操作失败，请重试" },
      { status: 500 }
    );
  }
}
