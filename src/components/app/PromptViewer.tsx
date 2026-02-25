"use client";

import React, { useState } from "react";

interface PromptViewerProps {
  prompt: {
    layers: Record<string, { label: string; content: string }>;
    model: { name: string; reason: string };
  } | null;
}

export default function PromptViewer({ prompt }: PromptViewerProps) {
  const [open, setOpen] = useState(false);

  if (!prompt) return null;

  const layerEntries = Object.entries(prompt.layers);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-[#1565C0] transition-colors hover:text-[#1565C0]/80"
      >
        <span className="text-sm">&#129504;</span>
        <span>{open ? "收起系统思考" : "查看系统思考过程"}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
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

      {open && (
        <div className="mt-2 rounded-lg bg-[#1565C0]/5 p-3 space-y-3">
          {/* Model selection */}
          <div className="rounded-md bg-white p-2.5 border border-[#1565C0]/15">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1565C0]/60">
                MODEL
              </span>
            </div>
            <p className="text-sm font-semibold text-[#111]">
              {prompt.model.name}
            </p>
            <p className="mt-0.5 text-xs text-[#666]">
              {prompt.model.reason}
            </p>
          </div>

          {/* Prompt layers */}
          <div className="space-y-2">
            {layerEntries.map(([key, layer], index) => (
              <div key={key} className="flex gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1565C0]/10 text-[10px] font-bold text-[#1565C0]">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#111]">
                    {layer.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#666] break-words">
                    {layer.content.length > 120
                      ? layer.content.slice(0, 120) + "..."
                      : layer.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
