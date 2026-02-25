// ============================================================================
// VietBridge AI V2 - Response Generator
// Parses raw LLM output and structures it into task-specific response formats
// ============================================================================

import type {
  ChatMessage,
  TranslationData,
  ReplyData,
  RiskData,
  TeachData,
  PromptDebugInfo,
} from "./types";
import { checkProactiveWarnings } from "../intelligence/proactive";
import type { ProactiveWarning } from "../intelligence/proactive";

// ---------------------------------------------------------------------------
// Options interface
// ---------------------------------------------------------------------------

export interface GenerateResponseOptions {
  /** Raw text output from the LLM completion */
  rawOutput: string;
  /** Task identifier: translate, reply, risk, or learn */
  task: string;
  /** Scene identifier (e.g., restaurant, couple, business) */
  scene: string;
  /** Tone level (1-10) */
  tone: number;
  /** Original user input text */
  input: string;
  /** Optional prompt layers for debug info */
  promptLayers?: Array<{ name: string; content: string }>;
  /** Optional model name for debug info */
  modelName?: string;
  /** Optional model selection reason for debug info */
  modelReason?: string;
}

// ---------------------------------------------------------------------------
// JSON extraction helper
// ---------------------------------------------------------------------------

/**
 * Attempts to extract and parse JSON from raw LLM output.
 * Handles cases where the LLM wraps JSON in markdown code fences or
 * includes extra text before/after the JSON object.
 */
function extractJSON(raw: string): Record<string, unknown> | null {
  // First, try direct parse
  try {
    return JSON.parse(raw);
  } catch {
    // Continue to fallback strategies
  }

  // Try extracting from markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      // Continue
    }
  }

  // Try finding the first { ... } or [ ... ] block
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
    } catch {
      // Fall through to null
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Task-specific structuring functions
// ---------------------------------------------------------------------------

function structureTranslation(
  parsed: Record<string, unknown>,
  input: string,
  scene: string
): TranslationData {
  const toneObj = (parsed.tone as Record<string, unknown>) || {};
  const grammar = (parsed.grammar as Record<string, unknown>) ||
    (parsed.grammarNote as Record<string, unknown>) || {};

  return {
    original: input,
    translation: String(parsed.translation || ""),
    natural: String(parsed.natural || parsed.naturalTranslation || ""),
    tone: toneObj.explanation
      ? String(toneObj.explanation)
      : String(parsed.tone || ""),
    scene,
    context: String(parsed.context || ""),
    culture: parsed.culture ? String(parsed.culture) : null,
    grammarNote: {
      self: String(
        toneObj.selfPronoun || grammar.self || grammar.selfPronoun || ""
      ),
      other: String(
        toneObj.otherPronoun || grammar.other || grammar.otherPronoun || ""
      ),
      particles: Array.isArray(toneObj.particles)
        ? toneObj.particles.map(String)
        : Array.isArray(grammar.particles)
          ? grammar.particles.map(String)
          : [],
      formality: String(
        toneObj.formality || grammar.formality || ""
      ),
    },
  };
}

function structureReply(
  parsed: Record<string, unknown>
): ReplyData {
  const rawReplies = Array.isArray(parsed.replies) ? parsed.replies : [];

  return {
    explanation: String(parsed.emotionExplanation || parsed.explanation || ""),
    emotion: String(parsed.emotion || ""),
    context: String(parsed.context || ""),
    replies: rawReplies.map((r: Record<string, unknown>) => ({
      level: Number(r.level) || 0,
      style: String(r.style || ""),
      text: String(r.vi || r.text || ""),
      zh: String(r.zh || ""),
    })),
  };
}

function structureRisk(
  parsed: Record<string, unknown>
): RiskData {
  const rawFactors = Array.isArray(parsed.factors) ? parsed.factors : [];
  const rawTips = Array.isArray(parsed.tips) ? parsed.tips : [];
  const rawScripts = Array.isArray(parsed.scripts) ? parsed.scripts : [];
  const rawKbHits = Array.isArray(parsed.kbHits || parsed.knowledgeHits)
    ? (parsed.kbHits || parsed.knowledgeHits) as Array<Record<string, unknown>>
    : [];

  return {
    score: Number(parsed.score) || 0,
    context: String(parsed.context || ""),
    situation: String(parsed.situation || ""),
    factors: rawFactors.map((f: Record<string, unknown>) => ({
      label: String(f.label || f.name || ""),
      weight: Number(f.weight) || 0,
      active: Boolean(f.active),
    })),
    tips: rawTips.map(String),
    scripts: rawScripts.map((s: Record<string, unknown>) => ({
      vi: String(s.vi || ""),
      zh: String(s.zh || ""),
    })),
    knowledgeHits: rawKbHits.map((h: Record<string, unknown>) => ({
      source: String(h.source || ""),
      confidence: Number(h.confidence) || 0,
      detail: String(h.detail || ""),
    })),
  };
}

function structureTeach(
  parsed: Record<string, unknown>
): TeachData {
  const phrase = (parsed.phrase as Record<string, unknown>) || {};
  const rawExamples = Array.isArray(parsed.examples) ? parsed.examples : [];

  return {
    context: String(parsed.context || ""),
    phrase: {
      vi: String(phrase.vi || parsed.phrase_vi || ""),
      zh: String(phrase.zh || parsed.phrase_zh || ""),
      pinyin: String(phrase.pinyin || parsed.pinyin || ""),
    },
    culture: String(parsed.culture || ""),
    examples: rawExamples.map((e: Record<string, unknown>) => ({
      vi: String(e.vi || ""),
      zh: String(e.zh || ""),
    })),
  };
}

// ---------------------------------------------------------------------------
// Build prompt debug info
// ---------------------------------------------------------------------------

function buildPromptDebugInfo(
  promptLayers?: Array<{ name: string; content: string }>,
  modelName?: string
): PromptDebugInfo | undefined {
  if (!promptLayers && !modelName) {
    return undefined;
  }

  const info: PromptDebugInfo = {};

  if (promptLayers && promptLayers.length > 0) {
    info.layers = {};
    for (const layer of promptLayers) {
      info.layers[layer.name] = {
        label: layer.name,
        content: layer.content,
      };
    }
  }

  if (modelName) {
    info.model = modelName;
  }

  return info;
}

// ---------------------------------------------------------------------------
// Map task ID to ChatMessage type
// ---------------------------------------------------------------------------

function taskToMessageType(
  task: string
): ChatMessage["type"] {
  switch (task) {
    case "translate":
      return "translation";
    case "reply":
      return "reply";
    case "risk":
      return "risk";
    case "learn":
      return "teaching";
    default:
      return "translation";
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Takes the raw LLM output and structures it into a task-specific ChatMessage.
 *
 * Pipeline:
 *  1. Parse JSON from raw output (with fallback extraction)
 *  2. Structure data according to task type
 *  3. Attach proactive warnings
 *  4. Attach prompt debug info if available
 *  5. Return a fully-formed ChatMessage
 *
 * If JSON parsing fails entirely, returns a plain text response so the user
 * still gets something useful.
 */
export function generateResponse(options: GenerateResponseOptions): ChatMessage {
  const {
    rawOutput,
    task,
    scene,
    tone,
    input,
    promptLayers,
    modelName,
    modelReason,
  } = options;

  // ── 1. Proactive warnings (always computed, independent of parse success) ──
  const proactiveWarnings: ProactiveWarning[] = checkProactiveWarnings(
    input,
    scene,
    tone
  );

  // ── 2. Prompt debug info ───────────────────────────────────────────────────
  const prompt = buildPromptDebugInfo(promptLayers, modelName);

  // ── 3. Attempt JSON parse ──────────────────────────────────────────────────
  const parsed = extractJSON(rawOutput);

  if (!parsed) {
    // JSON parsing failed — return a plain text fallback response
    return {
      type: taskToMessageType(task),
      text: rawOutput,
      prompt,
      proactiveWarnings: proactiveWarnings.length > 0
        ? proactiveWarnings
        : undefined,
    };
  }

  // ── 4. Structure data by task type ─────────────────────────────────────────
  let data: TranslationData | ReplyData | RiskData | TeachData;

  switch (task) {
    case "translate":
      data = structureTranslation(parsed, input, scene);
      break;
    case "reply":
      data = structureReply(parsed);
      break;
    case "risk":
      data = structureRisk(parsed);
      break;
    case "learn":
      data = structureTeach(parsed);
      break;
    default:
      // Unknown task — treat as translation
      data = structureTranslation(parsed, input, scene);
      break;
  }

  // ── 5. Assemble final ChatMessage ──────────────────────────────────────────
  const message: ChatMessage = {
    type: taskToMessageType(task),
    data,
    prompt,
    proactiveWarnings: proactiveWarnings.length > 0
      ? proactiveWarnings
      : undefined,
  };

  return message;
}
