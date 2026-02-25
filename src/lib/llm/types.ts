// ============================================================================
// VietBridge AI V2 - Shared LLM Types
// Core type definitions for chat messages and task-specific data structures
// ============================================================================

import type { ProactiveWarning } from "../intelligence/proactive";
import type { KBHit } from "../intelligence/knowledge-base";

// ---------------------------------------------------------------------------
// Chat message types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  type: "user" | "translation" | "reply" | "risk" | "teaching";
  text?: string;
  data?: TranslationData | ReplyData | RiskData | TeachData;
  prompt?: PromptDebugInfo;
  proactiveWarnings?: ProactiveWarning[];
  hasContext?: boolean;
}

export interface PromptDebugInfo {
  layers?: Record<string, { label: string; content: string }>;
  model?: string;
  tokens?: number;
}

// ---------------------------------------------------------------------------
// Translation task data
// ---------------------------------------------------------------------------

export interface TranslationData {
  original: string;
  translation: string;
  natural: string;
  tone: string;
  scene: string;
  context: string;
  culture: string | null;
  grammarNote: {
    self: string;
    other: string;
    particles: string[];
    formality: string;
  };
}

// ---------------------------------------------------------------------------
// Reply suggestion task data
// ---------------------------------------------------------------------------

export interface ReplyData {
  explanation: string;
  emotion: string;
  context: string;
  replies: Array<{
    level: number;
    style: string;
    text: string;
    zh: string;
  }>;
}

// ---------------------------------------------------------------------------
// Risk analysis task data
// ---------------------------------------------------------------------------

export interface RiskData {
  score: number;
  context: string;
  situation: string;
  factors: Array<{
    label: string;
    weight: number;
    active: boolean;
  }>;
  tips: string[];
  scripts: Array<{
    vi: string;
    zh: string;
  }>;
  knowledgeHits: KBHit[];
}

// ---------------------------------------------------------------------------
// Teaching / "Teach me to say" task data
// ---------------------------------------------------------------------------

export interface TeachData {
  context: string;
  phrase: {
    vi: string;
    zh: string;
    pinyin: string;
  };
  culture: string;
  examples: Array<{
    vi: string;
    zh: string;
  }>;
}

// ---------------------------------------------------------------------------
// Conversation message (for history tracking)
// ---------------------------------------------------------------------------

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}
