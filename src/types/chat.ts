// ============================================================================
// VietBridge AI V2 - Chat Types
// Re-exports from lib/llm/types.ts plus additional UI-specific types
// ============================================================================

// Re-export all core LLM types
export type {
  ChatMessage,
  PromptDebugInfo,
  TranslationData,
  ReplyData,
  RiskData,
  TeachData,
  Message,
} from "@/lib/llm/types";

// Re-export from intelligence modules
export type { ProactiveWarning } from "@/lib/intelligence/proactive";
export type { KBHit } from "@/lib/intelligence/knowledge-base";
export type { TaskId } from "@/lib/intelligence/tasks";
export type { SceneId } from "@/lib/intelligence/scene-rules";

// ---------------------------------------------------------------------------
// UI-specific chat types
// ---------------------------------------------------------------------------

/** Represents a single chat bubble in the UI */
export interface ChatBubble {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  taskId?: import("@/lib/intelligence/tasks").TaskId;
  data?: import("@/lib/llm/types").TranslationData
    | import("@/lib/llm/types").ReplyData
    | import("@/lib/llm/types").RiskData
    | import("@/lib/llm/types").TeachData;
  proactiveWarnings?: import("@/lib/intelligence/proactive").ProactiveWarning[];
  isStreaming?: boolean;
  debugInfo?: import("@/lib/llm/types").PromptDebugInfo;
}

/** Chat session metadata */
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
  scene?: import("@/lib/intelligence/scene-rules").SceneId;
}

/** Chat UI state */
export interface ChatUIState {
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  showDebug: boolean;
  showPromptLayers: boolean;
}

/** Chat input state */
export interface ChatInputState {
  text: string;
  scene: import("@/lib/intelligence/scene-rules").SceneId;
  tone: number;
  task: import("@/lib/intelligence/tasks").TaskId;
  autoDetect: boolean;
}

/** Chat settings that the user can configure */
export interface ChatSettings {
  defaultScene: import("@/lib/intelligence/scene-rules").SceneId;
  defaultTone: number;
  autoDetectIntent: boolean;
  showGrammarNotes: boolean;
  showCultureTips: boolean;
  showProactiveWarnings: boolean;
  developerMode: boolean;
}

/** Default chat settings */
export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  defaultScene: "general",
  defaultTone: 5,
  autoDetectIntent: true,
  showGrammarNotes: true,
  showCultureTips: true,
  showProactiveWarnings: true,
  developerMode: false,
};
