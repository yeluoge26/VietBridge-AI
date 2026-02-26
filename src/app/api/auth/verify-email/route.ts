// ============================================================================
// VietBridge AI V2 — Email Verification API
// GET /api/auth/verify-email?token=xxx — verifies email and redirects to login
// POST /api/auth/verify-email — resend verification email
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

// ── GET: Verify email with token ────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return redirectWithError("缺少验证令牌");
    }

    // Find valid token
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return redirectWithError("验证链接无效");
    }

    if (record.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return redirectWithError("验证链接已过期，请重新发送");
    }

    // Mark user email as verified
    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    // Redirect to login with success message
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${baseUrl}/login?verified=1`
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return redirectWithError("验证失败，请重试");
  }
}

// ── POST: Resend verification email ─────────────────────────────────────────
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "邮箱已验证" }, { status: 400 });
    }

    // Delete old tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: user.email! },
    });

    // Create new token (24h expiry)
    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(user.email!, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "发送失败，请重试" },
      { status: 500 }
    );
  }
}

// ── Helper ──────────────────────────────────────────────────────────────────
function redirectWithError(message: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.redirect(
    `${baseUrl}/login?error=${encodeURIComponent(message)}`
  );
}
