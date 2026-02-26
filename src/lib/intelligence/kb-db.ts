// ============================================================================
// VietBridge AI V2 — Database Knowledge Search
// Queries Prisma KnowledgeEntry table for relevant knowledge hits
// Complements the local in-memory knowledge base
// ============================================================================

import { prisma } from "@/lib/prisma";
import type { KBHit } from "./knowledge-base";

// Scene → category mapping for targeted DB queries
const SCENE_CATEGORIES: Record<string, string[]> = {
  restaurant: ["danang_prices", "scam_patterns"],
  rent: ["rent_rules", "contract_clauses", "scam_patterns"],
  business: ["contract_clauses", "scam_patterns"],
  hospital: ["scam_patterns"],
  housekeeping: ["scam_patterns"],
  general: ["danang_prices", "rent_rules", "scam_patterns"],
  couple: [],
  staff: [],
};

/**
 * Search the database KnowledgeEntry table for relevant hits.
 * Uses keyword matching against valueZh and valueVi fields.
 */
export async function searchDBKnowledge(
  input: string,
  scene: string
): Promise<KBHit[]> {
  try {
    const categories = SCENE_CATEGORIES[scene] || SCENE_CATEGORIES.general;
    if (categories.length === 0) return [];

    // Extract meaningful keywords (2+ chars) from input
    const keywords = input
      .toLowerCase()
      .replace(/[,.!?，。！？、]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2)
      .slice(0, 5); // Limit to 5 keywords for performance

    if (keywords.length === 0) return [];

    // Query DB for entries in relevant categories
    const entries = await prisma.knowledgeEntry.findMany({
      where: {
        category: { in: categories },
      },
      select: {
        category: true,
        key: true,
        valueZh: true,
        valueVi: true,
        confidence: true,
        source: true,
      },
    });

    // Score entries by keyword match
    const hits: KBHit[] = [];

    for (const entry of entries) {
      const lowerZh = entry.valueZh.toLowerCase();
      const lowerVi = entry.valueVi.toLowerCase();
      const lowerKey = entry.key.toLowerCase();

      let matchCount = 0;
      for (const kw of keywords) {
        if (lowerZh.includes(kw) || lowerVi.includes(kw) || lowerKey.includes(kw)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        hits.push({
          source: entry.source || entry.category,
          confidence: entry.confidence * (matchCount / keywords.length),
          detail: entry.valueZh,
        });
      }
    }

    // Sort by confidence and return top 5
    return hits
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  } catch (error) {
    console.error("[KB DB Search Error]", error);
    return [];
  }
}
