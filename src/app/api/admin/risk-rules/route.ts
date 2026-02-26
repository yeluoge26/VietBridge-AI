// ============================================================================
// VietBridge AI V2 — Admin Risk Rules API
// CRUD for risk engine rules with search/filter
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
  const severity = searchParams.get("severity");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (severity) where.severity = severity;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { rule: { contains: search, mode: "insensitive" } },
    ];
  }

  const rules = await prisma.riskRule.findMany({
    where,
    orderBy: { weight: "desc" },
  });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();

  const rule = await prisma.riskRule.create({
    data: {
      name: body.name || "",
      rule: body.rule || "",
      category: body.category || "general",
      weight: body.weight ?? 5,
      severity: body.severity || "medium",
      action: body.action || "warn",
      active: body.active ?? true,
    },
  });
  return NextResponse.json(rule, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.rule !== undefined) data.rule = body.rule;
  if (body.category !== undefined) data.category = body.category;
  if (body.weight !== undefined) data.weight = body.weight;
  if (body.severity !== undefined) data.severity = body.severity;
  if (body.action !== undefined) data.action = body.action;
  if (body.active !== undefined) data.active = body.active;

  const rule = await prisma.riskRule.update({ where: { id: body.id }, data });
  return NextResponse.json(rule);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

  await prisma.riskRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
