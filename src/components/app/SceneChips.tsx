"use client";

import React, { useRef, useEffect } from "react";

interface SceneChipsProps {
  activeScene: string;
  onSceneChange: (scene: string) => void;
  visible: boolean;
}

const scenes = [
  { id: "general", icon: "\uD83D\uDCA1", label: "通用", color: "#111" },
  { id: "business", icon: "\uD83D\uDCBC", label: "商务", color: "#2E7D32" },
  { id: "staff", icon: "\uD83D\uDC65", label: "员工管理", color: "#6A1B9A" },
  { id: "couple", icon: "\uD83D\uDC95", label: "情侣", color: "#D4697A" },
  { id: "restaurant", icon: "\uD83C\uDF7D\uFE0F", label: "餐厅", color: "#FF8A00" },
  { id: "rent", icon: "\uD83C\uDFE0", label: "租房", color: "#1565C0" },
  { id: "hospital", icon: "\uD83C\uDFE5", label: "医院", color: "#E53935" },
  { id: "repair", icon: "\uD83D\uDD27", label: "装修", color: "#795548" },
];

export default function SceneChips({
  activeScene,
  onSceneChange,
  visible,
}: SceneChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active chip into view
  useEffect(() => {
    if (!visible || !scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(
      `[data-scene="${activeScene}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeScene, visible]);

  if (!visible) return null;

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {scenes.map((scene) => {
        const isActive = activeScene === scene.id;
        return (
          <button
            key={scene.id}
            data-scene={scene.id}
            onClick={() => onSceneChange(scene.id)}
            className={`flex shrink-0 items-center gap-1 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.96] ${
              isActive
                ? "border-current bg-current/10 text-current"
                : "border-[#EDEDED] bg-white text-[#666] hover:bg-[#F2F1EF]"
            }`}
            style={
              isActive
                ? { color: scene.color, borderColor: scene.color, backgroundColor: `${scene.color}12` }
                : undefined
            }
          >
            <span>{scene.icon}</span>
            <span>{scene.label}</span>
          </button>
        );
      })}
    </div>
  );
}
