"use client";

import React from "react";

interface AutoDetectBannerProps {
  task: string;
  scene: string | null;
  confidence: number;
  onApply: () => void;
  visible: boolean;
}

const taskLabels: Record<string, string> = {
  translate: "翻译",
  reply: "回复建议",
  risk: "风险分析",
  learn: "教我说",
};

const sceneLabels: Record<string, string> = {
  general: "通用",
  business: "商务",
  staff: "员工管理",
  couple: "情侣",
  restaurant: "餐厅",
  rent: "租房",
  hospital: "医院",
  repair: "装修",
};

export default function AutoDetectBanner({
  task,
  scene,
  confidence,
  onApply,
  visible,
}: AutoDetectBannerProps) {
  if (!visible) return null;

  const taskLabel = taskLabels[task] ?? task;
  const sceneLabel = scene ? sceneLabels[scene] ?? scene : null;

  return (
    <button
      onClick={onApply}
      className="mx-4 flex items-center justify-between rounded-[12px] border border-[#EDEDED] bg-[#F2F1EF] px-3 py-2.5 transition-all hover:bg-[#EDEDED] active:scale-[0.99]"
    >
      <span className="text-xs text-[#666]">
        {"\uD83E\uDDE0"} 建议：
        <span className="font-semibold text-[#111]">{taskLabel}</span>
        {sceneLabel && (
          <>
            <span className="text-[#999]"> &middot; </span>
            <span className="font-medium text-[#111]">{sceneLabel}</span>
          </>
        )}
        <span className="ml-1 text-[#999]">
          (置信度{Math.round(confidence)}%)
        </span>
      </span>
      <span className="ml-2 shrink-0 text-xs font-semibold text-[#1565C0]">
        应用 &rarr;
      </span>
    </button>
  );
}
