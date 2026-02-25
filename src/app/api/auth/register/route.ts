// ============================================================================
// VietBridge AI V2 — Register API Route
// Validates input with zod, hashes password, creates user + FREE subscription
// ============================================================================

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

    // Create user + FREE subscription in transaction
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
