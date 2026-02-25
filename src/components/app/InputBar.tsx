"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  taskColor: string;
}

export default function InputBar({
  value,
  onChange,
  onSend,
  loading,
  taskColor,
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "38px";
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        onSend();
      }
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="border-t border-[#EDEDED] bg-white px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-2">
        {/* Input container with mic button inside */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入中文或越南语..."
            rows={1}
            className="w-full resize-none rounded-[12px] border border-[#EDEDED] bg-[#F2F1EF] py-2 pl-3 pr-10 text-sm text-[#111] outline-none transition-colors placeholder:text-[#999] focus:border-[#999] focus:bg-white"
            style={{ minHeight: "38px", maxHeight: "110px", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif" }}
          />
          {/* Mic button inside textarea */}
          <button
            type="button"
            className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#EDEDED] hover:text-[#666]"
            aria-label="语音输入"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>

        {/* Send button */}
        <button
          onClick={() => {
            if (hasText && !loading) onSend();
          }}
          disabled={!hasText || loading}
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] transition-all active:scale-[0.95] disabled:opacity-50"
          style={{
            backgroundColor: hasText ? taskColor : "#EDEDED",
          }}
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={hasText ? "#FFF" : "#999"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
