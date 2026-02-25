"use client";

import React from "react";

interface ContextRefProps {
  hasContext: boolean;
}

export default function ContextRef({ hasContext }: ContextRefProps) {
  if (!hasContext) return null;

  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#6A1B9A]/5 px-3 py-2">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#6A1B9A]" />
      <p className="text-xs text-[#6A1B9A]">
        <span className="font-semibold">{"\u2463"} 多轮上下文：</span>
        参考了之前的对话内容
      </p>
    </div>
  );
}
