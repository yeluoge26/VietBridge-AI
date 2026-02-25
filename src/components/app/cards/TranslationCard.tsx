"use client";

import React, { useState } from "react";
import PromptViewer from "../PromptViewer";
import ProactiveWarnings from "../ProactiveWarnings";
import ContextRef from "../ContextRef";

interface TranslationCardProps {
  data: {
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
  };
  prompt?: {
    layers: Record<string, { label: string; content: string }>;
    model: { name: string; reason: string };
  };
  proactiveWarnings?: Array<{ type: string; text: string }>;
  hasContext?: boolean;
  onCopy: (text: string) => void;
  onModify?: (mod: string) => void;
}

export default function TranslationCard({
  data,
  prompt,
  proactiveWarnings,
  hasContext,
  onCopy,
}: TranslationCardProps) {
  const [toneOpen, setToneOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white shadow-sm overflow-hidden">
      {/* Context header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2E7D32]" />
        <span className="text-xs font-medium text-[#666]">
          翻译 · {data.scene || data.context}
        </span>
      </div>

      <div className="px-4 pb-3 space-y-3">
        {/* Original text */}
        <div>
          <p className="text-xs text-[#999] mb-1">原文</p>
          <p className="text-sm text-[#666] leading-relaxed">
            {data.original}
          </p>
        </div>

        {/* Translation section */}
        <div className="rounded-lg bg-[#F2F1EF] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#111]">翻译</span>
            <div className="flex items-center gap-1">
              {/* Play button */}
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-colors hover:bg-[#EDEDED]"
                aria-label="播放"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#111"
                  stroke="none"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>
              {/* Copy button */}
              <button
                type="button"
                onClick={() => onCopy(data.translation)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-colors hover:bg-[#EDEDED]"
                aria-label="复制翻译"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-base font-medium text-[#111] leading-relaxed">
            {data.translation}
          </p>
        </div>

        {/* Natural section */}
        <div className="rounded-lg bg-[#2E7D32]/8 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#2E7D32]">
              {"\u2726"} 更自然
            </span>
            <button
              type="button"
              onClick={() => onCopy(data.natural)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-white"
              aria-label="复制自然翻译"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2E7D32"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
          <p className="text-base font-medium text-[#2E7D32] leading-relaxed">
            {data.natural}
          </p>
        </div>

        {/* Tone section (collapsible) */}
        <div className="rounded-lg border border-[#EDEDED]">
          <button
            type="button"
            onClick={() => setToneOpen(!toneOpen)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left"
          >
            <span className="text-xs font-semibold text-[#111]">
              {"\u2461"} 语气规则
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={`text-[#999] transition-transform ${
                toneOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="M3.5 5.25L7 8.75L10.5 5.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {toneOpen && (
            <div className="border-t border-[#EDEDED] px-3 py-2.5 space-y-2">
              <p className="text-xs leading-relaxed text-[#666]">
                {data.tone}
              </p>
              {data.grammarNote && (
                <div className="space-y-1.5">
                  <p className="text-xs text-[#666]">
                    <span className="font-medium text-[#111]">称呼自己：</span>
                    {data.grammarNote.self}
                  </p>
                  <p className="text-xs text-[#666]">
                    <span className="font-medium text-[#111]">称呼对方：</span>
                    {data.grammarNote.other}
                  </p>
                  <p className="text-xs text-[#666]">
                    <span className="font-medium text-[#111]">正式程度：</span>
                    {data.grammarNote.formality}
                  </p>
                  {data.grammarNote.particles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {data.grammarNote.particles.map((particle, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md bg-[#F2F1EF] px-2 py-0.5 text-[11px] font-medium text-[#666]"
                        >
                          {particle}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Culture note */}
        {data.culture && (
          <div className="rounded-lg bg-[#FF8A00]/8 px-3 py-2.5">
            <p className="text-xs leading-relaxed text-[#FF8A00]">
              <span className="mr-1">{"\uD83C\uDF0F"}</span>
              {data.culture}
            </p>
          </div>
        )}

        {/* Collapsible footer */}
        {(prompt || proactiveWarnings || hasContext) && (
          <div>
            {footerOpen && (
              <div className="space-y-0">
                <PromptViewer prompt={prompt || null} />
                <ProactiveWarnings warnings={proactiveWarnings || null} />
                <ContextRef hasContext={!!hasContext} />
              </div>
            )}
            <button
              type="button"
              onClick={() => setFooterOpen(!footerOpen)}
              className="mt-2 flex w-full items-center justify-center gap-1 py-1.5 text-xs text-[#999] transition-colors hover:text-[#666]"
            >
              <span>{footerOpen ? "收起详情" : "展开详情"}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform ${
                  footerOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
