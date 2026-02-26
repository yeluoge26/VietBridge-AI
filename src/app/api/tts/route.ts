// ============================================================================
// VietBridge AI V2 — Public TTS API
// POST: Generate speech audio via Alibaba Cloud NLS 2.0 with filesystem caching
// GET: Return available TTS models for frontend selection
// Auth: authenticated user or guest
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { getGuestId } from "@/lib/guest-id";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TtsModel added in schema, prisma generate pending
const db = prisma as any;

// Filesystem cache for generated audio
const CACHE_DIR = join(process.cwd(), "storage", "tts");

// Alibaba Cloud NLS 2.0 endpoints
const NLS_STREAM_URL =
  "https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts";
const NLS_ASYNC_URL =
  "https://nls-gateway-cn-shanghai.aliyuncs.com/rest/v1/tts/async";

// Short-text threshold (NLS stream API limit ~300 chars)
const SHORT_TEXT_LIMIT = 300;

// Max polling attempts for async long-text synthesis
const ASYNC_MAX_POLLS = 60;
const ASYNC_POLL_INTERVAL_MS = 3000;

// ---------------------------------------------------------------------------

function getCacheKey(text: string, lang: string, voice: string): string {
  return createHash("sha256")
    .update(`${lang}:${voice}:${text}`)
    .digest("hex");
}

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function readCache(hash: string): Buffer | null {
  const p = join(CACHE_DIR, `${hash}.mp3`);
  if (existsSync(p)) return readFileSync(p);
  return null;
}

function writeCache(hash: string, data: Buffer) {
  try {
    ensureCacheDir();
    writeFileSync(join(CACHE_DIR, `${hash}.mp3`), data);
  } catch (e) {
    console.error("[TTS] Cache write error:", e);
  }
}

// ---------------------------------------------------------------------------
// Alibaba NLS short-text streaming synthesis (synchronous, returns audio)
// ---------------------------------------------------------------------------
async function nlsStreamSynth(
  text: string,
  voice: string,
  appKey: string,
  token: string,
): Promise<Buffer> {
  const res = await fetch(NLS_STREAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appkey: appKey,
      token,
      text,
      format: "mp3",
      voice,
      sample_rate: 16000,
    }),
  });

  const ct = res.headers.get("content-type") || "";
  if (!res.ok || ct.includes("application/json")) {
    const errText = await res.text().catch(() => "Unknown");
    throw new Error(`NLS stream error ${res.status}: ${errText}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Alibaba NLS long-text async synthesis (submit + poll + download)
// ---------------------------------------------------------------------------
async function nlsAsyncSynth(
  text: string,
  voice: string,
  appKey: string,
  token: string,
): Promise<Buffer> {
  // 1. Submit synthesis task
  const submitRes = await fetch(NLS_ASYNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      header: { appkey: appKey, token },
      context: { device_id: "vietbridge-server" },
      payload: {
        enable_notify: false,
        tts_request: {
          text,
          voice,
          format: "mp3",
          sample_rate: 16000,
        },
      },
    }),
  });

  const submitJson = await submitRes.json();
  if (submitJson.error_code !== 20000000 || !submitJson.data?.task_id) {
    throw new Error(
      `NLS async submit failed: ${submitJson.error_message || JSON.stringify(submitJson)}`,
    );
  }

  const taskId = submitJson.data.task_id;

  // 2. Poll for completion
  for (let i = 0; i < ASYNC_MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, ASYNC_POLL_INTERVAL_MS));

    const pollUrl = `${NLS_ASYNC_URL}?appkey=${appKey}&task_id=${taskId}&token=${token}`;
    const pollRes = await fetch(pollUrl);
    const pollJson = await pollRes.json();

    if (
      pollJson.error_code === 20000000 &&
      pollJson.error_message === "SUCCESS" &&
      pollJson.data?.audio_address
    ) {
      // 3. Download audio
      const audioRes = await fetch(pollJson.data.audio_address);
      if (!audioRes.ok) {
        throw new Error(`Failed to download audio: ${audioRes.status}`);
      }
      return Buffer.from(await audioRes.arrayBuffer());
    }

    if (
      pollJson.error_code !== 20000000 ||
      (pollJson.error_message !== "RUNNING" &&
        pollJson.error_message !== "SUCCESS")
    ) {
      throw new Error(
        `NLS async task failed: ${pollJson.error_message || JSON.stringify(pollJson)}`,
      );
    }
  }

  throw new Error("NLS async synthesis timed out");
}

// ---------------------------------------------------------------------------
// POST /api/tts — synthesize text to speech (with caching)
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  const guestId = getGuestId(req);

  if (!user && !guestId) {
    return NextResponse.json(
      { error: "请先登录或提供访客ID" },
      { status: 401 },
    );
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
    return NextResponse.json(
      { error: "lang 必须为 zh 或 vi" },
      { status: 400 },
    );
  }

  try {
    // ---- Select TTS model config from DB ----
    let ttsModel = requestedModel
      ? await db.ttsModel.findFirst({
          where: { name: requestedModel, active: true },
        })
      : null;

    if (!ttsModel) {
      ttsModel = await db.ttsModel.findFirst({
        where: { active: true },
        orderBy: { isDefault: "desc" },
      });
    }

    const provider = ttsModel?.provider ?? "nls";
    const voice =
      lang === "zh"
        ? (ttsModel?.voiceZh ?? "xiaoyun")
        : (ttsModel?.voiceVi ?? "Tien");

    const trimmedText = text.trim();

    // ---- Cache lookup ----
    const hash = getCacheKey(trimmedText, lang, voice);
    ensureCacheDir();

    const cached = readCache(hash);
    if (cached) {
      return new NextResponse(new Uint8Array(cached), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
          "X-TTS-Cache": "hit",
        },
      });
    }

    // ---- Generate audio ----
    let audioBuffer: Buffer;

    if (provider === "nls" || provider === "dashscope") {
      // Alibaba Cloud NLS 2.0
      const appKey = process.env.NLS_APPKEY;
      const token = process.env.NLS_TOKEN;

      if (!appKey || !token) {
        return NextResponse.json(
          { error: "TTS 配置错误：缺少 NLS_APPKEY 或 NLS_TOKEN" },
          { status: 500 },
        );
      }

      if (trimmedText.length <= SHORT_TEXT_LIMIT) {
        // Short text → streaming (synchronous)
        audioBuffer = await nlsStreamSynth(trimmedText, voice, appKey, token);
      } else {
        // Long text → async task + poll + download
        audioBuffer = await nlsAsyncSynth(trimmedText, voice, appKey, token);
      }
    } else if (provider === "openai") {
      const apiModel = ttsModel?.apiModel ?? "tts-1";
      const endpoint =
        ttsModel?.apiEndpoint || "https://api.openai.com/v1/audio/speech";
      const apiKeyEnv = ttsModel?.apiKeyEnv ?? "OPENAI_API_KEY";
      const apiKey = process.env[apiKeyEnv];

      if (!apiKey) {
        return NextResponse.json(
          { error: "TTS 配置错误" },
          { status: 500 },
        );
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: apiModel,
          input: trimmedText,
          voice,
          response_format: "mp3",
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown");
        console.error("[TTS OpenAI] Error:", res.status, errText);
        return NextResponse.json(
          { error: "TTS 生成失败", details: errText },
          { status: 500 },
        );
      }

      audioBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      return NextResponse.json(
        { error: `不支持的 TTS provider: ${provider}` },
        { status: 400 },
      );
    }

    // ---- Write to cache ----
    writeCache(hash, audioBuffer);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Cache": "miss",
      },
    });
  } catch (err) {
    console.error("[TTS] Request failed:", err);
    return NextResponse.json({ error: "TTS 请求异常" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/tts — return available TTS models for frontend selection
// ---------------------------------------------------------------------------
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
