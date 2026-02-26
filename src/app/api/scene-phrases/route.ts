// ============================================================================
// VietBridge AI V2 — Public Scene Phrases API
// Returns active scene phrases for H5 frontend
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scene = searchParams.get("scene");

  const where: Record<string, unknown> = { active: true };
  if (scene) where.scene = scene;

  const phrases = await prisma.scenePhrase.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      scene: true,
      vi: true,
      zh: true,
      pinyin: true,
      culture: true,
    },
  });

  return NextResponse.json(phrases);
}
