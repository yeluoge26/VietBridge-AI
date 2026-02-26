// ============================================================================
// VietBridge AI V2 — Public Courses API
// Returns courses for the learn page (no auth required)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const daily = searchParams.get("daily");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (daily === "1") where.isDaily = true;

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(courses);
}
