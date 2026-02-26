// ============================================================================
// VietBridge AI V2 — Admin Scene Phrases API
// CRUD for scene learning phrases with search/filter
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
  const scene = searchParams.get("scene");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const where: Record<string, unknown> = {};
  if (scene) where.scene = scene;
  if (search) {
    where.OR = [
      { vi: { contains: search, mode: "insensitive" } },
      { zh: { contains: search, mode: "insensitive" } },
    ];
  }

  const [phrases, total] = await Promise.all([
    prisma.scenePhrase.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.scenePhrase.count({ where }),
  ]);

  return NextResponse.json({
    phrases,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();

  const phrase = await prisma.scenePhrase.create({
    data: {
      scene: body.scene || "general",
      vi: body.vi || "",
      zh: body.zh || "",
      pinyin: body.pinyin || "",
      culture: body.culture || "",
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(phrase, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.scene !== undefined) data.scene = body.scene;
  if (body.vi !== undefined) data.vi = body.vi;
  if (body.zh !== undefined) data.zh = body.zh;
  if (body.pinyin !== undefined) data.pinyin = body.pinyin;
  if (body.culture !== undefined) data.culture = body.culture;
  if (body.active !== undefined) data.active = body.active;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  const phrase = await prisma.scenePhrase.update({ where: { id: body.id }, data });
  return NextResponse.json(phrase);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  await prisma.scenePhrase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
