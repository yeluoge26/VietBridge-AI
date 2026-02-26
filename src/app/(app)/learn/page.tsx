"use client";

// ============================================================================
// VietBridge AI V2 — Learn Page
// Scene-based Vietnamese learning with daily phrases, quick phrases, and AI chat
// ============================================================================

import { useState } from "react";
import DailyCard from "@/components/app/cards/DailyCard";
import { DAILY_PHRASES, getPhrasesByScene } from "@/lib/intelligence/daily-phrases";
import { SCENES } from "@/lib/intelligence/scene-rules";
import { speak } from "@/lib/tts";

type LearnTab = "daily" | "scenes" | "phrases";

export default function LearnPage() {
  const [tab, setTab] = useState<LearnTab>("daily");
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const scenePhrases = selectedScene
    ? getPhrasesByScene(selectedScene)
    : DAILY_PHRASES;

  const tabs: { id: LearnTab; label: string }[] = [
    { id: "daily", label: "每日一句" },
    { id: "scenes", label: "场景学习" },
    { id: "phrases", label: "常用短语" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#F8F7F5]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F8F7F5] px-4 pt-4 pb-2">
        <h1 className="mb-3 text-lg font-bold text-[#111]">越南语学习</h1>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-xl bg-[#EDEDED] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedScene(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                tab === t.id
                  ? "bg-white text-[#111] shadow-sm"
                  : "text-[#999] hover:text-[#666]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* ── Tab: Daily ────────────────────────────────────────────────── */}
        {tab === "daily" && (
          <div className="space-y-4 pt-2">
            <DailyCard />

            {/* Previous phrases carousel */}
            <div className="px-4">
              <h2 className="mb-2 text-sm font-semibold text-[#111]">更多短语</h2>
              <div className="space-y-3">
                {DAILY_PHRASES.slice(0, 5).map((phrase, i) => (
                  <PhraseRow key={i} phrase={phrase} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Scenes ───────────────────────────────────────────────── */}
        {tab === "scenes" && !selectedScene && (
          <div className="grid grid-cols-2 gap-3 p-4">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene.id)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-[#EDEDED] bg-white p-4 transition-all hover:shadow-md active:scale-[0.97]"
              >
                <span className="text-2xl">{scene.emoji}</span>
                <span className="text-sm font-medium text-[#111]">{scene.label}</span>
                <span className="text-[11px] text-[#999]">
                  {getPhrasesByScene(scene.id).length} 个短语
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "scenes" && selectedScene && (
          <div className="p-4">
            <button
              onClick={() => setSelectedScene(null)}
              className="mb-3 flex items-center gap-1 text-sm text-[#999] hover:text-[#666]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              返回场景列表
            </button>
            <h2 className="mb-3 text-base font-bold text-[#111]">
              {SCENES.find((s) => s.id === selectedScene)?.emoji}{" "}
              {SCENES.find((s) => s.id === selectedScene)?.label}
            </h2>
            <div className="space-y-3">
              {scenePhrases.map((phrase, i) => (
                <PhraseRow key={i} phrase={phrase} expanded />
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Phrases ──────────────────────────────────────────────── */}
        {tab === "phrases" && (
          <div className="space-y-3 p-4">
            {DAILY_PHRASES.map((phrase, i) => (
              <PhraseRow key={i} phrase={phrase} expanded />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable Phrase Row ───────────────────────────────────────────────────

interface PhraseRowProps {
  phrase: { vi: string; zh: string; pinyin?: string; culture: string; scene: string };
  expanded?: boolean;
}

function PhraseRow({ phrase, expanded }: PhraseRowProps) {
  const [open, setOpen] = useState(false);
  const showDetails = expanded || open;

  return (
    <div className="rounded-xl border border-[#EDEDED] bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111] truncate">{phrase.vi}</p>
          <p className="text-xs text-[#888] truncate">{phrase.zh}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speak(phrase.vi, "vi-VN");
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 transition-colors hover:bg-[#2E7D32]/20"
          aria-label="播放"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#2E7D32" stroke="none">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </button>
      </button>

      {showDetails && (
        <div className="border-t border-[#EDEDED] px-4 py-3 space-y-2">
          {phrase.pinyin && (
            <p className="text-xs text-[#999] italic">{phrase.pinyin}</p>
          )}
          <div className="rounded-lg bg-[#F2F1EF] px-3 py-2">
            <p className="text-xs text-[#666]">
              <span className="mr-1">{"\uD83D\uDCA1"}</span>
              {phrase.culture}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
