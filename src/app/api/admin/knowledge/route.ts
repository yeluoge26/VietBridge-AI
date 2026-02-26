// ============================================================================
// VietBridge AI V2 — Admin Knowledge API
// CRUD for knowledge base entries
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createKnowledgeSchema, updateKnowledgeSchema } from "@/lib/validators/admin";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const entries = await prisma.knowledgeEntry.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const raw = await req.json();
  const parsed = createKnowledgeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误", details: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const body = parsed.data;

  const entry = await prisma.knowledgeEntry.create({
    data: {
      category: body.category,
      key: body.key,
      valueZh: body.valueZh || body.value || "",
      valueVi: body.valueVi,
      source: body.source,
      confidence: body.confidence,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const raw = await req.json();
  const parsed = updateKnowledgeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误", details: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const body = parsed.data;

  const entry = await prisma.knowledgeEntry.update({
    where: { id: body.id },
    data: {
      category: body.category,
      key: body.key,
      valueZh: body.valueZh || body.value,
      valueVi: body.valueVi,
      source: body.source,
      confidence: body.confidence,
    },
  });
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

  await prisma.knowledgeEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
