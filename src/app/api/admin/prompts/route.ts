// ============================================================================
// VietBridge AI V2 — Admin Prompts API
// CRUD for prompt versions
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createPromptSchema, updatePromptSchema } from "@/lib/validators/admin";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const versions = await prisma.promptVersion.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(versions);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const raw = await req.json();
  const parsed = createPromptSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误", details: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const body = parsed.data;

  const latest = await prisma.promptVersion.findFirst({ orderBy: { version: "desc" } });
  const latestNum = latest ? parseInt(latest.version.replace(/\D/g, "") || "0", 10) : 0;
  const nextVersion = `v${latestNum + 1}.0`;

  const version = await prisma.promptVersion.create({
    data: {
      version: body.version || nextVersion,
      changes: body.changes || "",
      status: body.status,
      abGroup: body.abGroup || null,
    },
  });
  return NextResponse.json(version, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const raw = await req.json();
  const parsed = updatePromptSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误", details: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const body = parsed.data;

  const version = await prisma.promptVersion.update({
    where: { id: body.id },
    data: {
      changes: body.changes,
      status: body.status,
      abGroup: body.abGroup,
      accuracyScore: body.accuracyScore,
      satisfactionScore: body.satisfactionScore,
    },
  });
  return NextResponse.json(version);
}
