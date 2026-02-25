// ============================================================================
// VietBridge AI V2 — Admin Risk Rules API
// CRUD for risk engine rules
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

  const rules = await prisma.riskRule.findMany({
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
      rule: body.rule || body.name || "",
      category: body.category,
      weight: body.weight ?? 10,
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
  if (!body.id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

  const rule = await prisma.riskRule.update({
    where: { id: body.id },
    data: {
      rule: body.rule || body.name,
      category: body.category,
      weight: body.weight,
      severity: body.severity,
      action: body.action,
      active: body.active,
    },
  });
  return NextResponse.json(rule);
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

  await prisma.riskRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
