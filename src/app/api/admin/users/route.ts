// ============================================================================
// VietBridge AI V2 — Admin Users API
// User management: list, create, update, delete
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          userLevel: true,
          totalCalls: true,
          createdAt: true,
          subscription: { select: { plan: true, currentPeriodEnd: true } },
          _count: { select: { usageLogs: true } },
        },
      }),
      prisma.user.count(),
    ]);

    const activeUsers = await prisma.user.count({
      where: { usageLogs: { some: {} } },
    });
    const paidUsers = await prisma.subscription.count({
      where: { plan: { not: "FREE" } },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        plan: u.subscription?.plan ?? "FREE",
        usageCount: u._count.usageLogs,
        _count: undefined,
        subscription: undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      funnel: { registered: total, firstUse: activeUsers, paid: paidUsers },
    });
  } catch (err) {
    console.error("[Users GET]", err);
    return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, email, password, role, userLevel } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已存在" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        hashedPassword,
        role: role || "user",
        userLevel: userLevel ?? 1,
        subscription: { create: { plan: "FREE" } },
      },
      select: { id: true, name: true, email: true, role: true, userLevel: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[Users POST]", err);
    return NextResponse.json({ error: "创建用户失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, name, email, password, role, userLevel } = body;

    if (!id) return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (userLevel !== undefined) data.userLevel = userLevel;
    if (password) data.hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, userLevel: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("[Users PUT]", err);
    return NextResponse.json({ error: "更新用户失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

    if (id === session.user.id) {
      return NextResponse.json({ error: "不能删除自己" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Users DELETE]", err);
    return NextResponse.json({ error: "删除用户失败" }, { status: 500 });
  }
}
