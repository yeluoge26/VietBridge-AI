// ============================================================================
// VietBridge AI V2 - Model Router
// Ported from V5 prototype selectModel + route matrix
// Routes requests to the optimal model based on task, scene, and user tier
// ============================================================================

import type { TaskId } from "../intelligence/tasks";
import type { SceneId } from "../intelligence/scene-rules";
import { estimateTokens } from "../token-estimator";

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
  "claude-sonnet": {
    name: "claude-3-5-sonnet-20241022",
    tier: "pro" as const,
    maxTokens: 4096,
  },
  "qwen-14b": {
    name: "qwen2.5-14b-instruct",
    tier: "free" as const,
    maxTokens: 2048,
  },
  "qwen-7b": {
    name: "qwen2.5-7b-instruct",
    tier: "free" as const,
    maxTokens: 1024,
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
 * Priority order for Pro users:
 *   OCR/Image → GPT-4o Vision
 *   Complex   → GPT-4o
 *   Standard  → Claude Sonnet
 *
 * Priority order for Free users:
 *   Complex   → Qwen 14B
 *   Standard  → Qwen 7B
 */

// ---------------------------------------------------------------------------
// Model selection
// ---------------------------------------------------------------------------

export function selectModel(params: SelectModelParams): ModelSelection {
  const { task, scene, input, isPro } = params;
  const inputTokens = estimateTokens(input);
  const complex = isComplexInput(input, task, scene);

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
    // Free users fall through to Qwen for text description
  }

  // --- Pro users ---
  if (isPro) {
    // Complex tasks → GPT-4o for best quality
    if (complex) {
      return {
        name: MODELS["gpt-4o"].name,
        reason: `复杂${task === "risk" ? "风险分析" : "任务"}，使用GPT-4o获取最佳质量`,
        tier: "pro",
        tokens: MODELS["gpt-4o"].maxTokens,
      };
    }

    // Standard Pro tasks → Claude Sonnet (good balance of quality and speed)
    return {
      name: MODELS["claude-sonnet"].name,
      reason: "Pro会员标准任务，使用Claude Sonnet",
      tier: "pro",
      tokens: MODELS["claude-sonnet"].maxTokens,
    };
  }

  // --- Free users ---

  // Complex free tasks → Qwen 14B
  if (complex) {
    return {
      name: MODELS["qwen-14b"].name,
      reason: `复杂任务，使用Qwen 14B提升质量（输入约${inputTokens}tokens）`,
      tier: "free",
      tokens: MODELS["qwen-14b"].maxTokens,
    };
  }

  // Default free → Qwen 7B
  return {
    name: MODELS["qwen-7b"].name,
    reason: "标准任务，使用Qwen 7B快速响应",
    tier: "free",
    tokens: MODELS["qwen-7b"].maxTokens,
  };
}
