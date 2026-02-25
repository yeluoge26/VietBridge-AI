"use client";

import React from "react";

export default function DailyCard() {
  return (
    <div className="mx-4 rounded-[14px] border border-[#EDEDED] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32]/10 text-sm">
          {"\uD83C\uDDFB\uD83C\uDDF3"}
        </span>
        <span className="text-xs font-semibold text-[#2E7D32]">
          今日越南语
        </span>
      </div>

      {/* Vietnamese phrase */}
      <p
        className="mb-1 text-base font-semibold text-[#111]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Xin ch&agrave;o, h&ocirc;m nay bạn khỏe kh&ocirc;ng?
      </p>

      {/* Chinese translation */}
      <p className="mb-3 text-sm text-[#666]">
        你好，你今天好吗？
      </p>

      {/* Cultural note */}
      <div className="rounded-[10px] bg-[#F2F1EF] px-3 py-2">
        <p className="text-xs text-[#999]">
          <span className="mr-1">{"\uD83D\uDCA1"}</span>
          <span className="text-[#666]">khỏe kh&ocirc;ng</span> 是关心近况的固定问候
        </p>
      </div>
    </div>
  );
}
