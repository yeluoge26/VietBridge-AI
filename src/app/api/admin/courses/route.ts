// ============================================================================
// VietBridge AI V2 — Admin Courses API
// CRUD for course/lesson management with search/filter
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
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { chinese: { contains: search, mode: "insensitive" } },
      { vietnamese: { contains: search, mode: "insensitive" } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.course.count({ where }),
  ]);

  return NextResponse.json({
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();

  const course = await prisma.course.create({
    data: {
      category: body.category || "general",
      chinese: body.chinese || "",
      vietnamese: body.vietnamese || "",
      pronunciation: body.pronunciation || "",
      culturalNote: body.culturalNote || "",
      exampleSentence: body.exampleSentence || "",
      difficulty: body.difficulty || "beginner",
      isDaily: body.isDaily ?? false,
    },
  });
  return NextResponse.json(course, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.category !== undefined) data.category = body.category;
  if (body.chinese !== undefined) data.chinese = body.chinese;
  if (body.vietnamese !== undefined) data.vietnamese = body.vietnamese;
  if (body.pronunciation !== undefined) data.pronunciation = body.pronunciation;
  if (body.culturalNote !== undefined) data.culturalNote = body.culturalNote;
  if (body.exampleSentence !== undefined) data.exampleSentence = body.exampleSentence;
  if (body.difficulty !== undefined) data.difficulty = body.difficulty;
  if (body.isDaily !== undefined) data.isDaily = body.isDaily;

  const course = await prisma.course.update({ where: { id: body.id }, data });
  return NextResponse.json(course);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
