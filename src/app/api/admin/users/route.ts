// ============================================================================
// VietBridge AI V2 — Admin Users API
// User analytics and management
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: { select: { plan: true } },
        _count: { select: { usageLogs: true } },
      },
    }),
    prisma.user.count(),
  ]);

  // Funnel data
  const totalUsers = total;
  const activeUsers = await prisma.user.count({
    where: { usageLogs: { some: {} } },
  });
  const paidUsers = await prisma.subscription.count({
    where: { plan: { not: "FREE" } },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      usageCount: u._count.usageLogs,
      _count: undefined,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    funnel: {
      registered: totalUsers,
      firstUse: activeUsers,
      paid: paidUsers,
    },
  });
}
