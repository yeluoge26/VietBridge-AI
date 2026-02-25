"use client";

import React, { useRef, useEffect } from "react";
import DailyCard from "./cards/DailyCard";

interface Message {
  id: string;
  type: string;
  role: "user" | "assistant";
  content: string;
  [key: string]: unknown;
}

interface ChatViewProps {
  messages: Message[];
  loading: boolean;
  taskColor: string;
  onTaskSelect: (task: string) => void;
  onModify: (mod: string) => void;
}

const quickActions = [
  { id: "translate", icon: "\uD83C\uDF10", label: "帮我翻译" },
  { id: "reply", icon: "\uD83D\uDCAC", label: "帮我回复" },
  { id: "risk", icon: "\uD83D\uDEE1\uFE0F", label: "风险检查" },
  { id: "learn", icon: "\uD83D\uDCD6", label: "教我说" },
];

function LoadingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 animate-bounce rounded-full"
            style={{
              backgroundColor: color,
              animationDelay: `${i * 150}ms`,
              animationDuration: "600ms",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-4 py-1.5">
      <div className="max-w-[80%] rounded-[14px] rounded-br-[4px] bg-[#111] px-4 py-2.5 text-sm text-white">
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({
  content,
  onModify,
}: {
  content: string;
  onModify: (mod: string) => void;
}) {
  return (
    <div className="flex justify-start px-4 py-1.5">
      <div className="max-w-[85%]">
        <div className="rounded-[14px] rounded-bl-[4px] border border-[#EDEDED] bg-white px-4 py-2.5 text-sm text-[#111] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
        {/* Modify chips */}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {["更正式", "更随意", "更简短"].map((mod) => (
            <button
              key={mod}
              onClick={() => onModify(mod)}
              className="rounded-[20px] border border-[#EDEDED] bg-white px-2.5 py-1 text-[11px] text-[#999] transition-colors hover:bg-[#F2F1EF] hover:text-[#666] active:scale-[0.97]"
            >
              {mod}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatView({
  messages,
  loading,
  taskColor,
  onTaskSelect,
  onModify,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {isEmpty ? (
        /* Empty state: DailyCard + quick actions */
        <div className="flex flex-col gap-4 pt-6">
          <DailyCard />

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-2.5 px-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onTaskSelect(action.id)}
                className="flex items-center gap-2 rounded-[14px] border border-[#EDEDED] bg-white px-4 py-3 text-left transition-all hover:bg-[#F8F7F5] hover:shadow-sm active:scale-[0.98]"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium text-[#111]">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Message list */
        <div className="flex flex-col gap-1 pt-3">
          {messages.map((msg) => {
            if (msg.role === "user") {
              return <UserBubble key={msg.id} content={msg.content} />;
            }
            return (
              <AssistantBubble
                key={msg.id}
                content={msg.content}
                onModify={onModify}
              />
            );
          })}
        </div>
      )}

      {/* Loading indicator */}
      {loading && <LoadingDots color={taskColor} />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
