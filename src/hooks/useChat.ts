"use client";

import { useState, useCallback } from "react";
import type { TaskId } from "@/lib/intelligence/tasks";
import type { SceneId } from "@/lib/intelligence/scene-rules";

export interface ChatMessage {
  type: "user" | "translation" | "reply" | "risk" | "teaching";
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prompt?: any;
  proactiveWarnings?: Array<{ type: string; text: string }>;
  hasContext?: boolean;
}

interface UseChatOptions {
  task: TaskId;
  scene: SceneId;
  tone: number;
  langDir: string;
}

export function useChat(options: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (input: string) => {
      if (!input.trim() || loading) return;

      // Add user message
      const userMsg: ChatMessage = { type: "user", text: input };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input,
            task: options.task,
            scene: options.scene,
            tone: options.tone,
            langDir: options.langDir,
            conversationHistory: messages,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "请求失败");
        }

        const result = await res.json();
        setMessages((prev) => [...prev, result]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "未知错误";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, options]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, send, clearMessages, setMessages };
}
