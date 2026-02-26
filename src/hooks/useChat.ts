"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getClientGuestId } from "@/hooks/useGuestId";
import type { TaskId } from "@/lib/intelligence/tasks";
import type { SceneId } from "@/lib/intelligence/scene-rules";

function guestHeaders(): Record<string, string> {
  const guestId = getClientGuestId();
  return guestId ? { "X-Guest-Id": guestId } : {};
}

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
  stream?: boolean;
}

export function useChat(options: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Keep ref in sync
  messagesRef.current = messages;

  // Abort in-flight streaming on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const send = useCallback(
    async (input: string) => {
      if (!input.trim() || loading) return;

      // Add user message
      const userMsg: ChatMessage = { type: "user", text: input };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        if (options.stream) {
          // ── Streaming mode (SSE) ──────────────────────────────────────────
          abortRef.current?.abort();
          const controller = new AbortController();
          abortRef.current = controller;

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...guestHeaders() },
            body: JSON.stringify({
              input,
              task: options.task,
              scene: options.scene,
              tone: options.tone,
              langDir: options.langDir,
              conversationHistory: messagesRef.current,
              conversationId,
              stream: true,
            }),
            signal: controller.signal,
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "请求失败");
          }

          const reader = res.body?.getReader();
          if (!reader) throw new Error("无法读取流");

          const decoder = new TextDecoder();
          let streamingText = "";

          // Add placeholder streaming message
          const placeholderMsg: ChatMessage = {
            type: "translation", // will be updated on done
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
                      updated[updated.length - 1] = {
                        ...last,
                        streamText: streamingText,
                      };
                    }
                    return updated;
                  });
                } else if (event.type === "done") {
                  // Replace streaming placeholder with final message
                  const { type: _eventType, messageType, ...finalData } = event;
                  if (event.conversationId) {
                    setConversationId(event.conversationId);
                  }
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      type: messageType || "translation",
                      ...finalData,
                    };
                    return updated;
                  });
                } else if (event.type === "error") {
                  throw new Error(event.error);
                }
              } catch (parseErr) {
                // Ignore JSON parse errors for incomplete chunks
                if (parseErr instanceof Error && parseErr.message !== "error") {
                  // only throw if it's our explicit error
                }
              }
            }
          }
        } else {
          // ── Non-streaming mode ────────────────────────────────────────────
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...guestHeaders() },
            body: JSON.stringify({
              input,
              task: options.task,
              scene: options.scene,
              tone: options.tone,
              langDir: options.langDir,
              conversationHistory: messagesRef.current,
              conversationId,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "请求失败");
          }

          const result = await res.json();
          if (result.conversationId) {
            setConversationId(result.conversationId);
          }
          setMessages((prev) => [...prev, result]);
        }
      } catch (err) {
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

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) return;

      const data = await res.json();
      setConversationId(id);

      const loaded: ChatMessage[] = data.messages.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (m: any) => {
          if (m.role === "user") {
            return { type: "user" as const, text: m.content };
          }
          // Try to use stored metadata for structured display
          if (m.metadata) {
            return {
              type: "translation" as const, // will be overridden by actual data
              data: m.metadata,
            };
          }
          return { type: "translation" as const, text: m.content };
        }
      );

      setMessages(loaded);
    } catch (err) {
      console.error("Load conversation error:", err);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    send,
    clearMessages,
    setMessages,
    conversationId,
    loadConversation,
  };
}
