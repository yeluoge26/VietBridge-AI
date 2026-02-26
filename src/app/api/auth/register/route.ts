// ============================================================================
// VietBridge AI V2 — Register API Route
// Validates input with zod, hashes password, creates user + FREE subscription
// ============================================================================

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少6个字符"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "输入无效";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user + FREE subscription + verification token in transaction
    const verificationToken = randomBytes(32).toString("hex");

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
        },
      });

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    sendVerificationEmail(email, verificationToken).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "注册失败，请重试" },
      { status: 500 }
    );
  }
}
