// ============================================================================
// VietBridge AI V2 — Admin Model Router API
// CRUD for model routing rules
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createRouterSchema, updateRouterSchema } from "@/lib/validators/admin";

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

  const raw = await req.json();
  const parsed = createRouterSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误", details: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const body = parsed.data;

  const route = await prisma.modelRoute.create({
    data: {
      taskType: body.taskType,
      sceneType: body.sceneType,
      primaryModel: body.primaryModel,
      fallbackModel: body.fallbackModel,
      apiBase: body.apiBase,
      apiKeyEnv: body.apiKeyEnv,
      maxCost: body.maxCost,
      maxLatency: body.maxLatency,
      active: body.active,
      userLevel: body.userLevel,
    },
  });
  return NextResponse.json(route, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const raw = await req.json();
  const parsed = updateRouterSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误", details: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const body = parsed.data;

  const route = await prisma.modelRoute.update({
    where: { id: body.id },
    data: {
      primaryModel: body.primaryModel,
      fallbackModel: body.fallbackModel,
      apiBase: body.apiBase,
      apiKeyEnv: body.apiKeyEnv,
      maxCost: body.maxCost,
      maxLatency: body.maxLatency,
      active: body.active,
      userLevel: body.userLevel,
    },
  });
  return NextResponse.json(route);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  await prisma.modelRoute.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
