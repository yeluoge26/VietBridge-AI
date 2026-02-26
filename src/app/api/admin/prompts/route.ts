// ============================================================================
// VietBridge AI V2 — Admin Prompts API
// CRUD for prompt versions with task/scene filtering
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

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const task = searchParams.get("task");
  const scene = searchParams.get("scene");

  const where: Record<string, unknown> = {};
  if (task) where.task = task;
  if (scene) where.scene = scene;

  const versions = await prisma.promptVersion.findMany({
    where,
    orderBy: [{ task: "asc" }, { scene: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(versions);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();

  const version = await prisma.promptVersion.create({
    data: {
      task: body.task || "TRANSLATION",
      scene: body.scene || "GENERAL",
      version: body.version || "v1.0",
      systemPrompt: body.systemPrompt || "",
      taskPrompt: body.taskPrompt || "",
      scenePrompt: body.scenePrompt || "",
      changes: body.changes || "新建",
      status: body.status || "draft",
      abGroup: body.abGroup || null,
    },
  });
  return NextResponse.json(version, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.systemPrompt !== undefined) data.systemPrompt = body.systemPrompt;
  if (body.taskPrompt !== undefined) data.taskPrompt = body.taskPrompt;
  if (body.scenePrompt !== undefined) data.scenePrompt = body.scenePrompt;
  if (body.status !== undefined) data.status = body.status;
  if (body.changes !== undefined) data.changes = body.changes;
  if (body.abGroup !== undefined) data.abGroup = body.abGroup;

  const version = await prisma.promptVersion.update({
    where: { id: body.id },
    data,
  });
  return NextResponse.json(version);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  await prisma.promptVersion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
