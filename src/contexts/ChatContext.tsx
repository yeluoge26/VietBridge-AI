"use client";

// ============================================================================
// VietBridge AI V2 — Chat Context Provider
// Manages chat state: task, scene, tone, messages, langDir, loading
// ============================================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface ChatState {
  task: string;
  scene: string;
  tone: number;
  messages: ChatMessage[];
  langDir: string;
  loading: boolean;
}

interface ChatContextValue extends ChatState {
  setTask: (task: string) => void;
  setScene: (scene: string) => void;
  setTone: (tone: number) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setLangDir: (langDir: string) => void;
  clearMessages: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [task, setTask] = useState("translate");
  const [scene, setScene] = useState("general");
  const [tone, setTone] = useState(50);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [langDir, setLangDir] = useState("zh-vi");
  const [loading, setLoading] = useState(false);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: ChatContextValue = {
    task,
    scene,
    tone,
    messages,
    langDir,
    loading,
    setTask,
    setScene,
    setTone,
    addMessage,
    setLoading,
    setLangDir,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
