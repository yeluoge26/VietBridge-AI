"use client";

import React from "react";
import { getTodayPhrase, type DailyPhrase } from "@/lib/intelligence/daily-phrases";
import { speak } from "@/lib/tts";

interface DailyCardProps {
  phrase?: DailyPhrase;
}

export default function DailyCard({ phrase }: DailyCardProps) {
  const today = phrase || getTodayPhrase();

  return (
    <div className="mx-4 rounded-[14px] border border-[#EDEDED] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32]/10 text-sm">
            {"\uD83C\uDDFB\uD83C\uDDF3"}
          </span>
          <span className="text-xs font-semibold text-[#2E7D32]">今日越南语</span>
        </div>
        <button
          type="button"
          onClick={() => speak(today.vi, "vi-VN")}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32]/10 transition-colors hover:bg-[#2E7D32]/20"
          aria-label="播放发音"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#2E7D32" stroke="none">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </button>
      </div>

      <p className="mb-1 text-base font-semibold text-[#111]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {today.vi}
      </p>
      <p className="mb-3 text-sm text-[#666]">{today.zh}</p>

      <div className="rounded-[10px] bg-[#F2F1EF] px-3 py-2">
        <p className="text-xs text-[#999]">
          <span className="mr-1">{"\uD83D\uDCA1"}</span>
          {today.culture}
        </p>
      </div>
    </div>
  );
}
