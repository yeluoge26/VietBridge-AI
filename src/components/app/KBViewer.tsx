"use client";

import React from "react";

interface KBViewerProps {
  hits: Array<{ source: string; confidence: number; detail: string }> | null;
}

export default function KBViewer({ hits }: KBViewerProps) {
  if (!hits || hits.length === 0) return null;

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF8A00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="text-xs font-semibold text-[#FF8A00]">
          知识库引用
        </span>
      </div>

      {/* Citation list */}
      <div className="space-y-2">
        {hits.map((hit, index) => (
          <div
            key={index}
            className="flex gap-2 rounded-md bg-[#FF8A00]/5 px-2.5 py-2"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF8A00]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed text-[#111]">
                {hit.detail}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] text-[#999]">{hit.source}</span>
                <span className="text-[10px] font-medium text-[#FF8A00]">
                  {Math.round(hit.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
