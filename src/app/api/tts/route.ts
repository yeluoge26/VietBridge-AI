// ============================================================================
// VietBridge AI V2 — Public TTS API
// POST: Generate speech audio via configurable TTS models
// Auth: authenticated user or guest
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { getGuestId } from "@/lib/guest-id";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TtsModel added in schema, prisma generate pending
const db = prisma as any;

const DASHSCOPE_ENDPOINT =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/generation";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  const guestId = getGuestId(req);

  if (!user && !guestId) {
    return NextResponse.json({ error: "请先登录或提供访客ID" }, { status: 401 });
  }

  let body: { text?: string; lang?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { text, lang, model: requestedModel } = body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "text 参数不能为空" }, { status: 400 });
  }

  if (!lang || (lang !== "zh" && lang !== "vi")) {
    return NextResponse.json({ error: "lang 必须为 zh 或 vi" }, { status: 400 });
  }

  try {
    // Select TTS model: by name, or default, or first active
    let ttsModel = requestedModel
      ? await db.ttsModel.findFirst({ where: { name: requestedModel, active: true } })
      : null;

    if (!ttsModel) {
      ttsModel = await db.ttsModel.findFirst({
        where: { active: true },
        orderBy: { isDefault: "desc" },
      });
    }

    // Fallback defaults if no DB config
    const provider = ttsModel?.provider ?? "dashscope";
    const apiModel = ttsModel?.apiModel ?? "cosyvoice-v1";
    const endpoint = ttsModel?.apiEndpoint || DASHSCOPE_ENDPOINT;
    const apiKeyEnv = ttsModel?.apiKeyEnv ?? "DASHSCOPE_API_KEY";
    const voiceZh = ttsModel?.voiceZh ?? "longxiaochun";
    const voiceVi = ttsModel?.voiceVi ?? "longxiaochun";

    const voice = lang === "zh" ? voiceZh : voiceVi;
    const apiKey = process.env[apiKeyEnv];

    if (!apiKey) {
      return NextResponse.json({ error: "TTS 服务配置错误" }, { status: 500 });
    }

    // Build request based on provider
    let fetchUrl: string;
    let fetchBody: string;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (provider === "openai") {
      fetchUrl = endpoint || "https://api.openai.com/v1/audio/speech";
      fetchBody = JSON.stringify({
        model: apiModel,
        input: text.trim(),
        voice,
        response_format: "mp3",
      });
    } else {
      // DashScope (default)
      fetchUrl = endpoint || DASHSCOPE_ENDPOINT;
      fetchBody = JSON.stringify({
        model: apiModel,
        input: { text: text.trim() },
        parameters: { voice, format: "mp3" },
      });
    }

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers,
      body: fetchBody,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("[TTS] Error:", response.status, errorText);
      return NextResponse.json(
        { error: "TTS 生成失败", details: errorText },
        { status: 500 }
      );
    }

    const audioBody = response.body;
    if (!audioBody) {
      return NextResponse.json({ error: "TTS 返回数据为空" }, { status: 500 });
    }

    return new NextResponse(audioBody, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[TTS] Request failed:", err);
    return NextResponse.json({ error: "TTS 请求异常" }, { status: 500 });
  }
}

// GET: return available TTS models for frontend selection
export async function GET() {
  try {
    const models = await db.ttsModel.findMany({
      where: { active: true },
      orderBy: { isDefault: "desc" },
      select: {
        name: true,
        displayName: true,
        provider: true,
        voiceZh: true,
        voiceVi: true,
        isDefault: true,
      },
    });

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] });
  }
}
