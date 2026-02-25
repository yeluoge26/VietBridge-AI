"use client";

import React, { useState } from "react";
import PromptViewer from "../PromptViewer";

interface TeachCardProps {
  data: {
    context: string;
    phrase: { vi: string; zh: string; pinyin: string };
    culture: string;
    examples: Array<{ vi: string; zh: string }>;
  };
  prompt?: {
    layers: Record<string, { label: string; content: string }>;
    model: { name: string; reason: string };
  } | null;
  onCopy: (text: string) => void;
}

export default function TeachCard({ data, prompt, onCopy }: TeachCardProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white shadow-sm overflow-hidden">
      {/* Context header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#6A1B9A]" />
        <span className="text-xs font-medium text-[#666]">
          教我说 · {data.context}
        </span>
      </div>

      <div className="px-4 pb-3 space-y-3">
        {/* Main phrase */}
        <div className="rounded-lg bg-[#6A1B9A]/5 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-[#111] leading-relaxed">
                {data.phrase.vi}
              </p>
              <p className="mt-1 text-sm italic text-[#6A1B9A]/70">
                {data.phrase.pinyin}
              </p>
              <p className="mt-1.5 text-sm text-[#666]">{data.phrase.zh}</p>
            </div>
            <button
              type="button"
              onClick={() => onCopy(data.phrase.vi)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 transition-colors hover:bg-white"
              aria-label="复制短语"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6A1B9A"
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

        {/* Culture note */}
        {data.culture && (
          <div className="rounded-lg bg-[#FF8A00]/8 px-3 py-2.5">
            <p className="text-xs leading-relaxed text-[#FF8A00]">
              <span className="mr-1">{"\uD83C\uDF0F"}</span>
              {data.culture}
            </p>
          </div>
        )}

        {/* Expandable examples */}
        {data.examples.length > 0 && (
          <div className="rounded-lg border border-[#EDEDED]">
            <button
              type="button"
              onClick={() => setExamplesOpen(!examplesOpen)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left"
            >
              <span className="text-xs font-semibold text-[#111]">
                例句({data.examples.length})
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`text-[#999] transition-transform ${
                  examplesOpen ? "rotate-180" : ""
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
            {examplesOpen && (
              <div className="border-t border-[#EDEDED] divide-y divide-[#EDEDED]">
                {data.examples.map((example, index) => (
                  <div key={index} className="px-3 py-2.5">
                    <p className="text-sm font-medium text-[#111] leading-relaxed">
                      {example.vi}
                    </p>
                    <p className="mt-0.5 text-xs text-[#999]">{example.zh}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prompt viewer */}
        <PromptViewer prompt={prompt || null} />
      </div>
    </div>
  );
}
