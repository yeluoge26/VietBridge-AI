// ============================================================================
// Import risk rules from CSV into database
// Usage: DATABASE_URL="..." npx tsx scripts/import-risk-rules.ts
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

/* ── Severity mapping ── */
const SEVERITY_MAP: Record<string, string> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

/* ── Action mapping ── */
const ACTION_MAP: Record<string, string> = {
  warn: "warn",
  warn_and_suggest: "warn",
  block: "block",
  block_and_warn: "block",
  review: "review",
};

async function main() {
  const csvPath = resolve(__dirname, "../../database/risk_rules_20260226_052017.csv");
  console.log(`Reading: ${csvPath}`);

  const raw = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);
  console.log(`Parsed ${rows.length} rows`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const row of rows) {
    const name = row.name?.trim() || "";
    const scene = row.scene?.trim() || "general";
    const condition = row.condition?.trim() || "";
    const severity = SEVERITY_MAP[row.severity?.trim().toLowerCase()] || "medium";
    const weight = parseInt(row.weight?.trim() || "5", 10);
    const action = ACTION_MAP[row.action?.trim().toLowerCase()] || "warn";
    const isActive = row.isActive?.trim() === "1" || row.isActive?.trim().toLowerCase() === "true";

    if (!name || !condition) {
      console.warn(`Skipping row: missing name or condition — name="${name}"`);
      errors++;
      continue;
    }

    // Generate stable ID from CSV row number
    const csvId = row.id?.trim();
    const id = `csv_risk_${scene}_${csvId || name.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "_").slice(0, 30)}`;

    try {
      const existing = await prisma.riskRule.findUnique({ where: { id } });
      await prisma.riskRule.upsert({
        where: { id },
        update: {
          name,
          rule: condition,
          category: scene,
          weight,
          severity,
          action,
          active: isActive,
        },
        create: {
          id,
          name,
          rule: condition,
          category: scene,
          weight,
          severity,
          action,
          active: isActive,
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
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
