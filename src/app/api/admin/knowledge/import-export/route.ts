// ============================================================================
// VietBridge AI V2 — Knowledge Base Import/Export API
// GET: Export all entries as JSON
// POST: Bulk import entries (upsert by category+key)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}

// Export all knowledge entries as JSON
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const entries = await prisma.knowledgeEntry.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      category: true,
      key: true,
      valueZh: true,
      valueVi: true,
      numericValue: true,
      rangeMin: true,
      rangeMax: true,
      unit: true,
      confidence: true,
      source: true,
    },
  });

  return new NextResponse(JSON.stringify({ version: "1.0", exportedAt: new Date().toISOString(), count: entries.length, entries }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="vietbridge-kb-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}

// Bulk import knowledge entries (upsert)
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  const entries = Array.isArray(body.entries) ? body.entries : Array.isArray(body) ? body : [];

  if (entries.length === 0) {
    return NextResponse.json({ error: "没有找到有效条目" }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const entry of entries) {
    try {
      if (!entry.category || !entry.key || !entry.valueZh) {
        errors++;
        continue;
      }

      const id = `import_${entry.category}_${entry.key}`;
      const existing = await prisma.knowledgeEntry.findUnique({ where: { id } });

      await prisma.knowledgeEntry.upsert({
        where: { id },
        update: {
          valueZh: entry.valueZh,
          valueVi: entry.valueVi || "",
          numericValue: entry.numericValue ?? null,
          rangeMin: entry.rangeMin ?? null,
          rangeMax: entry.rangeMax ?? null,
          unit: entry.unit ?? null,
          confidence: entry.confidence ?? 0.8,
          source: entry.source || "批量导入",
        },
        create: {
          id,
          category: entry.category,
          key: entry.key,
          valueZh: entry.valueZh,
          valueVi: entry.valueVi || "",
          numericValue: entry.numericValue ?? null,
          rangeMin: entry.rangeMin ?? null,
          rangeMax: entry.rangeMax ?? null,
          unit: entry.unit ?? null,
          confidence: entry.confidence ?? 0.8,
          source: entry.source || "批量导入",
        },
      });

      if (existing) updated++;
      else created++;
    } catch (err) {
      console.error("[KB Import Error]", err);
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    created,
    updated,
    errors,
    total: entries.length,
  });
}
