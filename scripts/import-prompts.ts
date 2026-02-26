// ============================================================================
// Import prompt versions from CSV into database
// Usage: DATABASE_URL="..." npx tsx scripts/import-prompts.ts
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

/* ── Task/Scene mapping ── */
const TASK_MAP: Record<string, string> = {
  translate: "TRANSLATION",
  reply: "REPLY",
  risk: "RISK",
  learn: "LEARN",
  scan: "SCAN",
};

const SCENE_MAP: Record<string, string> = {
  general: "GENERAL",
  business: "BUSINESS",
  staff: "STAFF",
  couple: "COUPLE",
  restaurant: "RESTAURANT",
  rent: "RENT",
  hospital: "HOSPITAL",
  housekeeping: "HOUSEKEEPING",
};

async function main() {
  const csvPath = resolve(__dirname, "../../database/prompt_versions_20260226_052012.csv");
  console.log(`Reading: ${csvPath}`);

  const raw = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);
  console.log(`Parsed ${rows.length} rows`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const row of rows) {
    const task = TASK_MAP[row.task?.trim().toLowerCase()] || row.task?.trim().toUpperCase();
    const scene = SCENE_MAP[row.scene?.trim().toLowerCase()] || row.scene?.trim().toUpperCase();
    const version = row.version?.trim() || "v1.0";
    const systemPrompt = row.systemPrompt?.trim() || "";
    const taskPrompt = row.taskPrompt?.trim() || "";
    const scenePrompt = row.scenePrompt?.trim() || "";
    const isActive = row.isActive?.trim() === "1" || row.isActive?.trim().toLowerCase() === "true";
    const abGroup = row.abGroup?.trim() || null;

    if (!task || !scene || !systemPrompt) {
      console.warn(`Skipping row: missing task/scene/systemPrompt — task=${row.task} scene=${row.scene}`);
      errors++;
      continue;
    }

    const id = `csv_prompt_${task.toLowerCase()}_${scene.toLowerCase()}_${version}`;

    try {
      const existing = await prisma.promptVersion.findUnique({ where: { id } });
      await prisma.promptVersion.upsert({
        where: { id },
        update: {
          systemPrompt,
          taskPrompt,
          scenePrompt,
          status: isActive ? "active" : "archived",
          abGroup,
        },
        create: {
          id,
          task: task as any,
          scene: scene as any,
          version,
          systemPrompt,
          taskPrompt,
          scenePrompt,
          changes: `CSV导入 ${version}`,
          status: isActive ? "active" : "archived",
          abGroup,
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
