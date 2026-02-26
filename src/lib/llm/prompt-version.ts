// ============================================================================
// VietBridge AI — Prompt Version Loader
// Loads active prompt override from DB with in-memory cache
// Supports AB test group assignment
// ============================================================================

import { prisma } from "../prisma";

// ---------------------------------------------------------------------------
// In-memory cache (60s TTL)
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 60_000; // 60 seconds
let activeOverrideCache: CacheEntry<string | null> | null = null;
let abVersionsCache: CacheEntry<ABVersion[]> | null = null;

interface ABVersion {
  id: string;
  changes: string;
  abGroup: string;
}

// ---------------------------------------------------------------------------
// Simple deterministic hash for AB assignment
// ---------------------------------------------------------------------------

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ---------------------------------------------------------------------------
// Get active prompt override (no AB)
// ---------------------------------------------------------------------------

export async function getActivePromptOverride(): Promise<string | null> {
  const now = Date.now();
  if (activeOverrideCache && now - activeOverrideCache.timestamp < CACHE_TTL) {
    return activeOverrideCache.data;
  }

  const version = await prisma.promptVersion.findFirst({
    where: { status: "active", abGroup: null },
    orderBy: { createdAt: "desc" },
    select: { changes: true },
  });

  const result = version?.changes || null;
  activeOverrideCache = { data: result, timestamp: now };
  return result;
}

// ---------------------------------------------------------------------------
// Get AB prompt override (deterministic by userId)
// ---------------------------------------------------------------------------

export interface ABPromptResult {
  override: string | null;
  abGroup: string | null;
  versionId: string | null;
}

async function getABVersions(): Promise<ABVersion[]> {
  const now = Date.now();
  if (abVersionsCache && now - abVersionsCache.timestamp < CACHE_TTL) {
    return abVersionsCache.data;
  }

  const versions = await prisma.promptVersion.findMany({
    where: { status: "active", abGroup: { not: null } },
    select: { id: true, changes: true, abGroup: true },
  });

  const result = versions.filter(
    (v): v is ABVersion => v.abGroup !== null
  );
  abVersionsCache = { data: result, timestamp: now };
  return result;
}

export async function getABPromptOverride(
  userId: string
): Promise<ABPromptResult> {
  const abVersions = await getABVersions();

  if (abVersions.length > 0) {
    // Deterministic assignment: hash userId → index into AB versions
    const index = simpleHash(userId) % abVersions.length;
    const assigned = abVersions[index];
    return {
      override: assigned.changes,
      abGroup: assigned.abGroup,
      versionId: assigned.id,
    };
  }

  // No AB versions → fall back to regular active version
  const override = await getActivePromptOverride();
  return { override, abGroup: null, versionId: null };
}
