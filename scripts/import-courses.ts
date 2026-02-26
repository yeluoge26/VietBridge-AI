// ============================================================================
// Import courses/lessons from CSV into database
// Usage: DATABASE_URL="..." npx tsx scripts/import-courses.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

/* ── CSV parser (handles multiline quoted fields) ── */
function parseCSV(raw: string): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = [];
  const lines = raw.split("\n");
  const headers = parseCSVLine(lines[0]);

  let i = 1;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    let fullLine = lines[i];
    while (countQuotes(fullLine) % 2 !== 0 && i + 1 < lines.length) {
      i++;
      fullLine += "\n" + lines[i];
    }

    const values = parseCSVLine(fullLine);
    if (values.length >= headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
      rows.push(row);
    }
    i++;
  }
  return rows;
}

function countQuotes(s: string): number {
  let count = 0;
  for (const ch of s) if (ch === '"') count++;
  return count;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/* ── Difficulty mapping ── */
const DIFFICULTY_MAP: Record<string, string> = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

async function main() {
  const csvPath = resolve(__dirname, "../../database/lessons_20260226_052006.csv");
  console.log(`Reading: ${csvPath}`);

  const raw = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);
  console.log(`Parsed ${rows.length} rows`);

  let created = 0;
  let errors = 0;

  // Batch insert for performance
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const data = batch.map((row) => {
      const chinese = row.chinese?.trim() || "";
      const vietnamese = row.vietnamese?.trim() || "";
      const pronunciation = row.pronunciation?.trim() || "";
      const culturalNote = row.culturalNote?.trim() || "";
      const exampleSentence = row.exampleSentence?.trim() || "";
      const category = row.category?.trim() || "general";
      const difficulty = DIFFICULTY_MAP[row.difficulty?.trim().toLowerCase()] || "beginner";
      const isDaily = row.isDaily?.trim() === "1" || row.isDaily?.trim().toLowerCase() === "true";

      if (!chinese && !vietnamese) return null;

      return {
        category,
        chinese,
        vietnamese,
        pronunciation,
        culturalNote,
        exampleSentence,
        difficulty,
        isDaily,
      };
    }).filter(Boolean) as Array<{
      category: string;
      chinese: string;
      vietnamese: string;
      pronunciation: string;
      culturalNote: string;
      exampleSentence: string;
      difficulty: string;
      isDaily: boolean;
    }>;

    try {
      const result = await prisma.course.createMany({ data });
      created += result.count;
    } catch (err) {
      console.error(`Error importing batch at row ${i}:`, err);
      errors += batch.length;
    }

    if ((i + batchSize) % 500 === 0 || i + batchSize >= rows.length) {
      console.log(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
    }
  }

  console.log(`\nImport complete:`);
  console.log(`  Created: ${created}`);
  console.log(`  Errors: ${errors}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
