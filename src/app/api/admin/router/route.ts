// ============================================================================
// VietBridge AI V2 — Admin Model Router API
// CRUD for model routing rules
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const routes = await prisma.modelRoute.findMany({
    orderBy: [{ taskType: "asc" }, { sceneType: "asc" }],
  });
  return NextResponse.json(routes);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  const route = await prisma.modelRoute.create({
    data: {
      taskType: body.taskType,
      sceneType: body.sceneType,
      primaryModel: body.primaryModel,
      fallbackModel: body.fallbackModel || null,
      maxCost: body.maxCost ?? 0.01,
      maxLatency: body.maxLatency ?? 3000,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(route, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

  const route = await prisma.modelRoute.update({
    where: { id: body.id },
    data: {
      primaryModel: body.primaryModel,
      fallbackModel: body.fallbackModel,
      maxCost: body.maxCost,
      maxLatency: body.maxLatency,
      active: body.active,
    },
  });
  return NextResponse.json(route);
}
