"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  taskColor: string;
  voiceLang?: string;
}

export default function InputBar({
  value,
  onChange,
  onSend,
  loading,
  taskColor,
  voiceLang = "zh-CN",
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceResult = useCallback(
    (text: string) => {
      onChange(value + text);
    },
    [value, onChange]
  );

  const { listening, supported, interim, toggle } = useVoiceInput({
    lang: voiceLang,
    onResult: handleVoiceResult,
  });

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
  const displayValue = listening && interim ? value + interim : value;

  return (
    <div className="border-t border-[#EDEDED] bg-white px-3 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
      {/* Voice listening indicator */}
      {listening && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="text-xs text-red-600">
            {interim ? interim : "正在聆听..."}
          </span>
          <button
            type="button"
            onClick={toggle}
            className="ml-auto text-xs font-medium text-red-600 hover:text-red-800"
          >
            停止
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Input container with mic button inside */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入中文或越南语..."
            rows={1}
            className="w-full resize-none rounded-[12px] border border-[#EDEDED] bg-[#F2F1EF] py-2 pl-3 pr-10 text-sm text-[#111] outline-none transition-colors placeholder:text-[#999] focus:border-[#999] focus:bg-white"
            style={{ minHeight: "38px", maxHeight: "110px", fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif" }}
          />
          {/* Mic button inside textarea */}
          {supported && (
            <button
              type="button"
              onClick={toggle}
              className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                listening
                  ? "bg-red-500 text-white scale-110"
                  : "text-[#999] hover:bg-[#EDEDED] hover:text-[#666]"
              }`}
              aria-label={listening ? "停止语音输入" : "语音输入"}
            >
              {listening ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
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
              )}
            </button>
          )}
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
