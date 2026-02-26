// ============================================================================
// VietBridge AI — Batch TTS Generator
// Synthesize all Vietnamese text from database into MP3 files via Alibaba NLS
// Usage: npx tsx scripts/batch-tts.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const NLS_GATEWAY = "https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts";
const APPKEY = process.env.NLS_APPKEY!;
const TOKEN = process.env.NLS_TOKEN!;
const VOICE = process.env.NLS_VOICE || "xiaoyun";

// Directories
const BASE_DIR = join(process.cwd(), "storage", "tts");
const COURSE_DIR = join(BASE_DIR, "courses");
const SCENE_DIR = join(BASE_DIR, "scenes");
const KNOWLEDGE_DIR = join(BASE_DIR, "knowledge");
const CACHE_DIR = BASE_DIR; // hash-based cache at root level

// Rate limiting: delay between API calls (ms)
const DELAY_MS = 300;

// Short-text limit for NLS streaming API
const MAX_TEXT_LEN = 300;

// ── Stats ──
let total = 0;
let cached = 0;
let generated = 0;
let failed = 0;

// ── Helpers ──

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function getCacheHash(text: string, voice: string): string {
  return createHash("sha256").update(`vi:${voice}:${text}`).digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function synthesize(text: string): Promise<Buffer | null> {
  // Truncate if too long for streaming API
  const t = text.length > MAX_TEXT_LEN ? text.slice(0, MAX_TEXT_LEN) : text;

  try {
    const res = await fetch(NLS_GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appkey: APPKEY,
        token: TOKEN,
        text: t,
        format: "mp3",
        voice: VOICE,
        sample_rate: 16000,
      }),
    });

    const ct = res.headers.get("content-type") || "";
    if (!res.ok || ct.includes("application/json")) {
      const err = await res.text().catch(() => "?");
      console.error(`    ✗ NLS error ${res.status}: ${err.slice(0, 200)}`);
      return null;
    }

    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    console.error(`    ✗ Fetch error: ${e}`);
    return null;
  }
}

async function generateAndSave(
  text: string,
  categoryDir: string,
  fileId: string,
): Promise<void> {
  total++;
  if (!text || text.trim().length === 0) return;

  const trimmed = text.trim();
  const hash = getCacheHash(trimmed, VOICE);
  const cachePath = join(CACHE_DIR, `${hash}.mp3`);
  const namedPath = join(categoryDir, `${fileId}.mp3`);

  // Already generated?
  if (existsSync(namedPath)) {
    cached++;
    return;
  }

  // Check hash cache
  if (existsSync(cachePath)) {
    // Copy from hash cache to named location
    const data = require("fs").readFileSync(cachePath);
    writeFileSync(namedPath, data);
    cached++;
    return;
  }

  // Synthesize via NLS
  const audio = await synthesize(trimmed);
  if (!audio || audio.length < 100) {
    failed++;
    return;
  }

  // Save both hash cache and named file
  writeFileSync(cachePath, audio);
  writeFileSync(namedPath, audio);
  generated++;

  await sleep(DELAY_MS);
}

// ── Main ──

async function main() {
  if (!APPKEY || !TOKEN) {
    console.error("Error: NLS_APPKEY and NLS_TOKEN must be set in environment");
    process.exit(1);
  }

  console.log("=== VietBridge AI — Batch TTS Generator ===");
  console.log(`NLS AppKey: ${APPKEY.slice(0, 4)}***`);
  console.log(`Voice: ${VOICE}\n`);

  // Ensure directories
  [CACHE_DIR, COURSE_DIR, SCENE_DIR, KNOWLEDGE_DIR].forEach(ensureDir);

  // ── 1. Courses (vietnamese field) ──
  const courses = await prisma.course.findMany({
    select: { id: true, vietnamese: true, chinese: true },
  });
  console.log(`[1/3] Courses: ${courses.length} entries`);

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    if (i % 100 === 0 && i > 0) {
      console.log(`  ... ${i}/${courses.length} (generated: ${generated}, cached: ${cached}, failed: ${failed})`);
    }
    await generateAndSave(c.vietnamese, COURSE_DIR, c.id);
  }
  console.log(`  ✓ Courses done (generated: ${generated}, cached: ${cached})\n`);

  // ── 2. Scene Phrases (vi field) ──
  const scenes = await prisma.scenePhrase.findMany({
    where: { active: true },
    select: { id: true, vi: true, zh: true },
  });
  console.log(`[2/3] Scene Phrases: ${scenes.length} entries`);

  const prevGen = generated;
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (i % 100 === 0 && i > 0) {
      console.log(`  ... ${i}/${scenes.length} (generated: ${generated - prevGen})`);
    }
    await generateAndSave(s.vi, SCENE_DIR, s.id);
  }
  console.log(`  ✓ Scenes done\n`);

  // ── 3. Knowledge (valueVi field — skip empty) ──
  const knowledge = await prisma.knowledgeEntry.findMany({
    select: { id: true, valueVi: true, key: true },
  });
  const nonEmpty = knowledge.filter((k) => k.valueVi && k.valueVi.trim().length > 0);
  console.log(`[3/3] Knowledge: ${nonEmpty.length} entries (${knowledge.length - nonEmpty.length} empty skipped)`);

  const prevGen2 = generated;
  for (let i = 0; i < nonEmpty.length; i++) {
    const k = nonEmpty[i];
    if (i % 50 === 0 && i > 0) {
      console.log(`  ... ${i}/${nonEmpty.length} (generated: ${generated - prevGen2})`);
    }
    await generateAndSave(k.valueVi, KNOWLEDGE_DIR, k.id);
  }
  console.log(`  ✓ Knowledge done\n`);

  // ── Summary ──
  console.log("=== Summary ===");
  console.log(`Total entries:  ${total}`);
  console.log(`Already cached: ${cached}`);
  console.log(`Generated:      ${generated}`);
  console.log(`Failed:         ${failed}`);
  console.log(`\nMP3 files saved to: ${BASE_DIR}`);
  console.log(`  courses/    — ${courses.length} files`);
  console.log(`  scenes/     — ${scenes.length} files`);
  console.log(`  knowledge/  — ${nonEmpty.length} files`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
