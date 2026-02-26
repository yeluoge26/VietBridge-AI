// ============================================================================
// VietBridge AI V2 — Admin TTS Model Management
// CRUD for TTS models (multi-model routing)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TtsModel added in schema, prisma generate pending
const db = prisma as any;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const models = await db.ttsModel.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({ models });
  } catch (err) {
    console.error("[TTS Config GET]", err);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, displayName, provider, apiModel, apiEndpoint, apiKeyEnv, voiceZh, voiceVi, speed, isDefault, active } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name 不能为空" }, { status: 400 });
    }

    // If this is set as default, unset all others
    if (isDefault) {
      await db.ttsModel.updateMany({ data: { isDefault: false } });
    }

    const model = await db.ttsModel.create({
      data: {
        name,
        displayName: displayName || "",
        provider: provider || "dashscope",
        apiModel: apiModel || "cosyvoice-v1",
        apiEndpoint: apiEndpoint || "",
        apiKeyEnv: apiKeyEnv || "DASHSCOPE_API_KEY",
        voiceZh: voiceZh || "longxiaochun",
        voiceVi: voiceVi || "longxiaochun",
        speed: speed ?? 1.0,
        isDefault: isDefault ?? false,
        active: active ?? true,
      },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (err) {
    console.error("[TTS Config POST]", err);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id 不能为空" }, { status: 400 });
    }

    // If setting as default, unset all others first
    if (updates.isDefault) {
      await db.ttsModel.updateMany({ data: { isDefault: false } });
    }

    const data: Record<string, unknown> = {};
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.displayName !== undefined) data.displayName = updates.displayName;
    if (updates.provider !== undefined) data.provider = updates.provider;
    if (updates.apiModel !== undefined) data.apiModel = updates.apiModel;
    if (updates.apiEndpoint !== undefined) data.apiEndpoint = updates.apiEndpoint;
    if (updates.apiKeyEnv !== undefined) data.apiKeyEnv = updates.apiKeyEnv;
    if (updates.voiceZh !== undefined) data.voiceZh = updates.voiceZh;
    if (updates.voiceVi !== undefined) data.voiceVi = updates.voiceVi;
    if (updates.speed !== undefined) data.speed = updates.speed;
    if (updates.isDefault !== undefined) data.isDefault = updates.isDefault;
    if (updates.active !== undefined) data.active = updates.active;

    const model = await db.ttsModel.update({ where: { id }, data });
    return NextResponse.json(model);
  } catch (err) {
    console.error("[TTS Config PUT]", err);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id 不能为空" }, { status: 400 });
    }

    await db.ttsModel.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TTS Config DELETE]", err);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
