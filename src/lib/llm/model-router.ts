// ============================================================================
// VietBridge AI V2 - Model Router
// Ported from V5 prototype selectModel + route matrix
// Routes requests to the optimal model based on task, scene, and user tier
// ============================================================================

import type { TaskId } from "../intelligence/tasks";
import type { SceneId } from "../intelligence/scene-rules";
import { estimateTokens } from "../token-estimator";
import { prisma } from "../prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelSelection {
  name: string;
  reason: string;
  tier: "free" | "pro";
  tokens: number;
}

export interface SelectModelParams {
  task: TaskId;
  scene: SceneId;
  input: string;
  isPro: boolean;
  userLevel?: number;
}

// ---------------------------------------------------------------------------
// Model definitions
// ---------------------------------------------------------------------------

const MODELS = {
  "gpt-4o": {
    name: "gpt-4o",
    tier: "pro" as const,
    maxTokens: 4096,
  },
  "qwen-plus": {
    name: "qwen-plus",
    tier: "free" as const,
    maxTokens: 4096,
  },
  "gpt-4o-vision": {
    name: "gpt-4o",
    tier: "pro" as const,
    maxTokens: 4096,
  },
};

// ---------------------------------------------------------------------------
// Complexity detection
// ---------------------------------------------------------------------------

/**
 * Determine if the input represents a complex request.
 * Complex requests benefit from larger models.
 */
function isComplexInput(input: string, task: TaskId, scene: SceneId): boolean {
  const tokenCount = estimateTokens(input);

  // Long inputs are inherently complex
  if (tokenCount > 200) return true;

  // Risk analysis is always complex
  if (task === "risk") return true;

  // Business and hospital scenes tend to need more nuance
  if (scene === "business" || scene === "hospital") return true;

  // Contract/legal language is complex
  if (/合同|条款|法律|法规|hợp đồng|điều khoản|luật/.test(input)) return true;

  // Multi-part questions
  if ((input.match(/[？?]/g) || []).length >= 2) return true;

  return false;
}

/**
 * Detect if input contains an image or OCR request.
 */
function hasImageContent(input: string): boolean {
  return /图片|截图|照片|OCR|识别|扫描|image|photo|screenshot|ảnh|hình/.test(
    input
  );
}

// ---------------------------------------------------------------------------
// Route matrix
// ---------------------------------------------------------------------------

/**
 * The route matrix defines model preference per task+complexity combination.
 *
 * Default model: Qwen3.5-Plus (qwen-plus) for all users.
 * Pro users on complex/OCR tasks escalate to GPT-4o.
 */

// ---------------------------------------------------------------------------
// DB-based route lookup (priority over hardcoded logic)
// ---------------------------------------------------------------------------

async function findDbRoute(
  task: string,
  scene: string,
  userLevel: number
): Promise<{ primaryModel: string; fallbackModel: string | null } | null> {
  const taskUpper = task.toUpperCase();
  const sceneUpper = scene.toUpperCase();

  // Try exact userLevel match first, then fallback to level 0 (all levels)
  const route = await prisma.modelRoute.findFirst({
    where: {
      taskType: taskUpper as never,
      sceneType: sceneUpper as never,
      active: true,
      userLevel: { in: [userLevel, 0] },
    },
    orderBy: { userLevel: "desc" }, // Prefer specific level over 0
  });

  if (!route) return null;
  return { primaryModel: route.primaryModel, fallbackModel: route.fallbackModel };
}

// ---------------------------------------------------------------------------
// Model selection
// ---------------------------------------------------------------------------

export function selectModel(params: SelectModelParams): ModelSelection {
  const { task, input, isPro } = params;
  const complex = isComplexInput(input, params.task, params.scene);

  // --- OCR / Image content → Vision model (Pro only) ---
  if (hasImageContent(input)) {
    if (isPro) {
      return {
        name: MODELS["gpt-4o-vision"].name,
        reason: "图片/OCR内容，使用GPT-4o Vision处理",
        tier: "pro",
        tokens: MODELS["gpt-4o-vision"].maxTokens,
      };
    }
    // Free users fall through to Qwen-Plus for text description
  }

  // --- Pro + complex → GPT-4o ---
  if (isPro && complex) {
    return {
      name: MODELS["gpt-4o"].name,
      reason: `复杂${task === "risk" ? "风险分析" : "任务"}，使用GPT-4o获取最佳质量`,
      tier: "pro",
      tokens: MODELS["gpt-4o"].maxTokens,
    };
  }

  // --- Default: Qwen3.5-Plus for all users ---
  return {
    name: MODELS["qwen-plus"].name,
    reason: isPro ? "Pro会员标准任务，使用Qwen-Plus" : "标准任务，使用Qwen-Plus",
    tier: isPro ? "pro" : "free",
    tokens: MODELS["qwen-plus"].maxTokens,
  };
}

/**
 * Enhanced model selection with DB route lookup.
 * Checks ModelRoute table first (supports per-level routing),
 * falls back to hardcoded logic.
 */
export async function selectModelAsync(
  params: SelectModelParams
): Promise<ModelSelection> {
  const { task, scene, isPro, userLevel = 1 } = params;

  try {
    const dbRoute = await findDbRoute(task, scene, userLevel);
    if (dbRoute) {
      return {
        name: dbRoute.primaryModel,
        reason: `DB\u8DEF\u7531\u5339\u914D (L${userLevel})`,
        tier: isPro ? "pro" : "free",
        tokens: 4096,
      };
    }
  } catch {
    // DB lookup failed, fall through to hardcoded logic
  }

  return selectModel(params);
}
