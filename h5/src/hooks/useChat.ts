import { useState, useCallback, useRef, useEffect } from "react";
import { buildHeaders } from "@/api/client";

const API_BASE = import.meta.env.VITE_API_BASE || "";
import type { TaskId } from "@/data/tasks";
import type { SceneId } from "@/data/scenes";

export interface ChatMessage {
  type: "user" | "translation" | "reply" | "risk" | "teaching";
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prompt?: any;
  proactiveWarnings?: Array<{ type: string; text: string }>;
  hasContext?: boolean;
  streaming?: boolean;
  streamText?: string;
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  messagesRef.current = messages;

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const send = useCallback(
    async (input: string) => {
      if (!input.trim() || loading) return;

      const userMsg: ChatMessage = { type: "user", text: input };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        // Always use streaming
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(API_BASE + "/api/chat", {
          method: "POST",
          headers: buildHeaders(),
          body: JSON.stringify({
            input,
            task: options.task,
            scene: options.scene,
            tone: options.tone,
            langDir: options.langDir,
            conversationHistory: messagesRef.current.map((m) => ({
              role: m.type === "user" ? "user" : "assistant",
              content: m.text || m.streamText || JSON.stringify(m.data) || "",
            })),
            ...(conversationId ? { conversationId } : {}),
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "请求失败");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("无法读取流");

        const decoder = new TextDecoder();
        let streamingText = "";

        const placeholderMsg: ChatMessage = {
          type: "translation",
          streaming: true,
          streamText: "",
        };
        setMessages((prev) => [...prev, placeholderMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "delta") {
                streamingText += event.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.streaming) {
                    updated[updated.length - 1] = { ...last, streamText: streamingText };
                  }
                  return updated;
                });
              } else if (event.type === "done") {
                const { type: _eventType, messageType, ...finalData } = event;
                if (event.conversationId) setConversationId(event.conversationId);
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { type: messageType || "translation", ...finalData };
                  return updated;
                });
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            } catch {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "未知错误";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loading, options, conversationId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return { messages, loading, error, send, clearMessages, setMessages, conversationId };
}
