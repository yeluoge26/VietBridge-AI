// ============================================================================
// VietBridge AI V2 — Admin API Validators
// Zod schemas for admin CRUD operations
// ============================================================================

import { z } from "zod";

// ── Prompts ────────────────────────────────────────────────────────────────

export const createPromptSchema = z.object({
  version: z.string().max(50).optional(),
  changes: z.string().max(2000).optional(),
  status: z.enum(["draft", "active", "archived"]).optional().default("draft"),
  abGroup: z.string().max(50).nullable().optional(),
});

export const updatePromptSchema = z.object({
  id: z.string().min(1),
  changes: z.string().max(2000).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  abGroup: z.string().max(50).nullable().optional(),
  accuracyScore: z.number().min(0).max(100).optional(),
  satisfactionScore: z.number().min(0).max(100).optional(),
});

// ── Knowledge ──────────────────────────────────────────────────────────────

export const createKnowledgeSchema = z.object({
  category: z.string().min(1).max(100),
  key: z.string().min(1).max(200),
  valueZh: z.string().max(5000).optional(),
  value: z.string().max(5000).optional(),
  valueVi: z.string().max(5000).optional().default(""),
  source: z.string().max(200).optional().default(""),
  confidence: z.number().min(0).max(1).optional().default(0.9),
});

export const updateKnowledgeSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1).max(100).optional(),
  key: z.string().min(1).max(200).optional(),
  valueZh: z.string().max(5000).optional(),
  value: z.string().max(5000).optional(),
  valueVi: z.string().max(5000).optional(),
  source: z.string().max(200).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// ── Risk Rules ─────────────────────────────────────────────────────────────

export const createRiskRuleSchema = z.object({
  rule: z.string().max(500).optional(),
  name: z.string().max(200).optional(),
  category: z.string().min(1).max(100),
  weight: z.number().min(0).max(100).optional().default(10),
  severity: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  action: z.enum(["warn", "block", "review"]).optional().default("warn"),
  active: z.boolean().optional().default(true),
});

export const updateRiskRuleSchema = z.object({
  id: z.string().min(1),
  rule: z.string().max(500).optional(),
  name: z.string().max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  weight: z.number().min(0).max(100).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  action: z.enum(["warn", "block", "review"]).optional(),
  active: z.boolean().optional(),
});

// ── Model Router ───────────────────────────────────────────────────────────

const taskTypeEnum = z.enum(["TRANSLATION", "REPLY", "RISK", "LEARN", "SCAN"]);
const sceneTypeEnum = z.enum(["GENERAL", "BUSINESS", "STAFF", "COUPLE", "RESTAURANT", "RENT", "HOSPITAL", "REPAIR"]);

export const createRouterSchema = z.object({
  taskType: taskTypeEnum,
  sceneType: sceneTypeEnum,
  primaryModel: z.string().min(1).max(100),
  fallbackModel: z.string().max(100).nullable().optional().default(null),
  maxCost: z.number().min(0).optional().default(0.01),
  maxLatency: z.number().min(0).optional().default(3000),
  active: z.boolean().optional().default(true),
});

export const updateRouterSchema = z.object({
  id: z.string().min(1),
  primaryModel: z.string().min(1).max(100).optional(),
  fallbackModel: z.string().max(100).nullable().optional(),
  maxCost: z.number().min(0).optional(),
  maxLatency: z.number().min(0).optional(),
  active: z.boolean().optional(),
});
