"use client";

import React from "react";
import PromptViewer from "../PromptViewer";
import ProactiveWarnings from "../ProactiveWarnings";
import ContextRef from "../ContextRef";

interface ReplyCardProps {
  data: {
    explanation: string;
    emotion: string;
    context: string;
    replies: Array<{
      level: number;
      style: string;
      text: string;
      zh: string;
    }>;
  };
  tone: number;
  prompt?: {
    layers: Record<string, { label: string; content: string }>;
    model: { name: string; reason: string };
  } | null;
  proactiveWarnings?: Array<{ type: string; text: string }>;
  hasContext?: boolean;
  onCopy: (text: string) => void;
  onSpeak?: (text: string, lang?: "vi-VN" | "zh-CN") => void;
  onShare?: (text: string) => void;
}

const replyStyleConfig: Record<
  number,
  { bgClass: string; borderClass: string; labelColor: string }
> = {
  1: {
    bgClass: "bg-[#2E7D32]/6",
    borderClass: "border-[#2E7D32]/15",
    labelColor: "text-[#2E7D32]",
  },
  2: {
    bgClass: "bg-[#1565C0]/6",
    borderClass: "border-[#1565C0]/15",
    labelColor: "text-[#1565C0]",
  },
  3: {
    bgClass: "bg-[#E53935]/6",
    borderClass: "border-[#E53935]/15",
    labelColor: "text-[#E53935]",
  },
};

const defaultStyle = {
  bgClass: "bg-[#F2F1EF]",
  borderClass: "border-[#EDEDED]",
  labelColor: "text-[#666]",
};

export default function ReplyCard({
  data,
  tone,
  prompt,
  proactiveWarnings,
  hasContext,
  onCopy,
  onSpeak,
  onShare,
}: ReplyCardProps) {
  // Find the reply closest to the user's tone setting
  const closestReply = data.replies.reduce((prev, curr) =>
    Math.abs(curr.level - tone) < Math.abs(prev.level - tone) ? curr : prev
  );

  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white shadow-sm overflow-hidden">
      {/* Context header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#1565C0]" />
        <span className="text-xs font-medium text-[#666]">
          回复建议 · {data.context}
        </span>
      </div>

      <div className="px-4 pb-3 space-y-3">
        {/* Emotion analysis */}
        <div>
          <p className="text-xs font-semibold text-[#111] mb-1.5">情绪分析</p>
          <p className="text-xs leading-relaxed text-[#666]">
            {data.explanation}
          </p>
          <span className="mt-1.5 inline-flex items-center rounded-full bg-[#FF8A00]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#FF8A00]">
            {data.emotion}
          </span>
        </div>

        {/* Reply styles */}
        <div className="space-y-2.5">
          {data.replies.map((reply, index) => {
            const config = replyStyleConfig[reply.level] || defaultStyle;
            const isRecommended = reply === closestReply;

            return (
              <div
                key={index}
                className={`rounded-lg border p-3 ${config.bgClass} ${config.borderClass}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${config.labelColor}`}
                    >
                      {reply.style}
                    </span>
                    {isRecommended && (
                      <span className="inline-flex items-center rounded-full bg-[#2E7D32] px-2 py-0.5 text-[10px] font-bold text-white">
                        推荐
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Play button */}
                    <button
                      type="button"
                      onClick={() => onSpeak?.(reply.text, "vi-VN")}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-white"
                      aria-label="播放"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={config.labelColor}>
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </button>
                    {/* Share button */}
                    <button
                      type="button"
                      onClick={() => onShare?.(reply.text)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-white"
                      aria-label="分享"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={config.labelColor}>
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </button>
                    {/* Copy button */}
                    <button
                      type="button"
                      onClick={() => onCopy(reply.text)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-white"
                      aria-label={`复制${reply.style}回复`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={config.labelColor}
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Vietnamese text */}
                <p className="text-sm font-medium text-[#111] leading-relaxed">
                  {reply.text}
                </p>
                {/* Chinese translation */}
                <p className="mt-1 text-xs text-[#999] leading-relaxed">
                  {reply.zh}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer sections */}
        <PromptViewer prompt={prompt || null} />
        <ProactiveWarnings warnings={proactiveWarnings || null} />
        <ContextRef hasContext={!!hasContext} />
      </div>
    </div>
  );
}
