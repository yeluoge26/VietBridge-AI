"use client";

import React from "react";

interface ContextBarProps {
  task: string;
  scene: string;
  location: string;
  langDir: string;
  onToggleLang: () => void;
}

const taskMeta: Record<string, { label: string; color: string }> = {
  translate: { label: "翻译", color: "#111" },
  reply: { label: "回复建议", color: "#1565C0" },
  risk: { label: "风险分析", color: "#E53935" },
  learn: { label: "教我说", color: "#2E7D32" },
};

const sceneMeta: Record<string, { label: string; color: string }> = {
  general: { label: "通用场景", color: "#111" },
  business: { label: "商务", color: "#2E7D32" },
  staff: { label: "员工管理", color: "#6A1B9A" },
  couple: { label: "情侣", color: "#D4697A" },
  restaurant: { label: "餐厅", color: "#FF8A00" },
  rent: { label: "租房", color: "#1565C0" },
  hospital: { label: "医院", color: "#E53935" },
  repair: { label: "装修", color: "#795548" },
};

export default function ContextBar({
  task,
  scene,
  location,
  langDir,
  onToggleLang,
}: ContextBarProps) {
  const t = taskMeta[task] ?? taskMeta.translate;
  const s = sceneMeta[scene] ?? sceneMeta.general;

  return (
    <div className="flex items-center justify-between bg-white/80 px-4 py-2 backdrop-blur-sm border-b border-[#EDEDED]">
      {/* Left: context info */}
      <div className="flex items-center gap-1.5 text-xs text-[#666]">
        {/* Colored dot */}
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: t.color }}
        />
        <span className="font-medium" style={{ color: t.color }}>
          {t.label}
        </span>
        <span className="text-[#999]">&middot;</span>
        <span>{s.label}</span>
        {location && (
          <>
            <span className="text-[#999]">&middot;</span>
            <span>{"\uD83D\uDCCD"}{location}</span>
          </>
        )}
      </div>

      {/* Right: language toggle */}
      <button
        onClick={onToggleLang}
        className="flex items-center gap-1 rounded-[20px] border border-[#EDEDED] bg-[#F2F1EF] px-2.5 py-1 text-[11px] font-medium text-[#666] transition-colors hover:bg-[#EDEDED] active:scale-[0.97]"
      >
        <span>{langDir === "zh-vi" ? "中" : "越"}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        <span>{langDir === "zh-vi" ? "越" : "中"}</span>
      </button>
    </div>
  );
}
