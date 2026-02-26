// ============================================================================
// VietBridge AI — API Key Management Endpoints (Admin)
// GET: list keys | POST: generate new key | PATCH: enable/disable
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-keys";
import {
  createApiKeySchema,
  updateApiKeySchema,
} from "@/lib/validators/api-keys";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

// GET /api/admin/api-keys — list all API keys for the current admin
export async function GET() {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "无权限" }, { status: 403 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      calls: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(keys);
}

// POST /api/admin/api-keys — generate a new API key
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "无权限" }, { status: 403 });

  const raw = await req.json();
  const parsed = createApiKeySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "参数错误" },
      { status: 400 }
    );
  }

  const { fullKey, keyHash, prefix } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      keyHash,
      prefix,
    },
  });

  return NextResponse.json(
    {
      id: apiKey.id,
      name: apiKey.name,
      key: fullKey, // shown only on creation
      prefix: apiKey.prefix,
      createdAt: apiKey.createdAt,
      warning: "请立即保存此密钥，关闭后将无法再次查看完整密钥。",
    },
    { status: 201 }
  );
}

// PATCH /api/admin/api-keys — enable/disable a key
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "无权限" }, { status: 403 });

  const raw = await req.json();
  const parsed = updateApiKeySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  const existing = await prisma.apiKey.findFirst({
    where: { id: parsed.data.id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "密钥不存在" }, { status: 404 });
  }

  const updated = await prisma.apiKey.update({
    where: { id: parsed.data.id },
    data: { active: parsed.data.active },
    select: { id: true, name: true, prefix: true, active: true },
  });
  return NextResponse.json(updated);
}
