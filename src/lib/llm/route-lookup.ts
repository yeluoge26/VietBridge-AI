// ============================================================================
// VietBridge AI — Model Route DB Lookup
// Cached lookup for ModelRoute configuration (fallback, maxCost, maxLatency)
// ============================================================================

import { prisma } from "../prisma";

interface RouteConfig {
  fallbackModel?: string;
  maxCost?: number;
  maxLatency?: number;
}

// In-memory cache: 120s TTL
const CACHE_TTL = 120_000;
const cache = new Map<string, { data: RouteConfig | null; timestamp: number }>();

export async function lookupModelRoute(
  taskType: string,
  sceneType: string
): Promise<RouteConfig | null> {
  const key = `${taskType}:${sceneType}`;
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Only query DB for scene types that exist in the ModelRoute enum
  const validSceneTypes = new Set([
    "GENERAL", "BUSINESS", "STAFF", "COUPLE",
    "RESTAURANT", "RENT", "HOSPITAL", "HOUSEKEEPING",
  ]);
  const upperScene = sceneType.toUpperCase();

  // For scenes not in DB enum, return null (use defaults)
  if (!validSceneTypes.has(upperScene)) {
    cache.set(key, { data: null, timestamp: now });
    return null;
  }

  const route = await prisma.modelRoute.findFirst({
    where: {
      taskType: taskType.toUpperCase() as "TRANSLATION" | "REPLY" | "RISK" | "LEARN" | "SCAN",
      sceneType: upperScene as "GENERAL" | "BUSINESS" | "STAFF" | "COUPLE" | "RESTAURANT" | "RENT" | "HOSPITAL" | "HOUSEKEEPING",
      active: true,
    },
    select: {
      fallbackModel: true,
      maxCost: true,
      maxLatency: true,
    },
  });

  const result: RouteConfig | null = route
    ? {
        fallbackModel: route.fallbackModel || undefined,
        maxCost: route.maxCost || undefined,
        maxLatency: route.maxLatency || undefined,
      }
    : null;

  cache.set(key, { data: result, timestamp: now });
  return result;
}
