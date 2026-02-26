// ============================================================================
// Import knowledge entries from CSV into database
// Usage: DATABASE_URL="..." npx tsx scripts/import-knowledge.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

function parseCSV(raw: string): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = [];
  const lines = raw.split("\n");
  const headers = parseCSVLine(lines[0]);

  let i = 1;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    // Accumulate lines until we have a complete CSV row
    let fullLine = lines[i];
    // Count quotes to detect multiline fields
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

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\u00c0-\u024f]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
}

async function main() {
  const csvPath = resolve(__dirname, "../../database/knowledge_entries_20260226_052002.csv");
  console.log(`Reading: ${csvPath}`);

  const raw = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);
  console.log(`Parsed ${rows.length} rows`);

  let created = 0;
  let updated = 0;
  let errors = 0;
  const seen = new Set<string>();

  for (const row of rows) {
    const category = row.category?.trim();
    const title = row.title?.trim();
    const content = row.content?.trim();

    if (!category || !title || !content) {
      errors++;
      continue;
    }

    const key = slugify(title);
    const id = `csv_${category}_${key}`;

    // Skip duplicates within this import
    if (seen.has(id)) continue;
    seen.add(id);

    // Split content: if contains Vietnamese text (after blank line), separate
    const parts = content.split(/\n\n/);
    let valueZh = content;
    let valueVi = "";

    if (parts.length >= 2) {
      // Check if second part looks Vietnamese (contains diacritics like ă, ơ, ư, đ, etc.)
      const viPattern = /[ăâđêôơư]/i;
      if (viPattern.test(parts[parts.length - 1])) {
        valueZh = parts.slice(0, -1).join("\n\n");
        valueVi = parts[parts.length - 1];
      }
    }

    try {
      const existing = await prisma.knowledgeEntry.findUnique({ where: { id } });
      await prisma.knowledgeEntry.upsert({
        where: { id },
        update: {
          valueZh,
          valueVi,
          confidence: 0.85,
          source: "CSV导入 2026-02-26",
        },
        create: {
          id,
          category,
          key,
          valueZh,
          valueVi,
          confidence: 0.85,
          source: "CSV导入 2026-02-26",
        },
      });
      if (existing) updated++;
      else created++;
    } catch (err) {
      console.error(`Error importing ${id}:`, err);
      errors++;
    }
  }

  console.log(`\nImport complete:`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Skipped duplicates: ${rows.length - created - updated - errors}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
