"use client";

import React, { useId } from "react";

interface ToneSliderProps {
  value: number;
  onChange: (v: number) => void;
}

function getToneInfo(value: number): { label: string; color: string } {
  if (value <= 20) return { label: "很委婉", color: "#2E7D32" };
  if (value <= 40) return { label: "礼貌", color: "#1565C0" };
  if (value <= 60) return { label: "普通", color: "#FF8A00" };
  if (value <= 80) return { label: "直接", color: "#E53935" };
  return { label: "强势", color: "#B71C1C" };
}

export default function ToneSlider({ value, onChange }: ToneSliderProps) {
  const tone = getToneInfo(value);
  const sliderId = useId();
  const sliderClass = `tone-slider-${sliderId.replace(/:/g, "")}`;

  return (
    <div className="px-4 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-[#666]">语气强度</span>
        <span
          className="text-xs font-semibold"
          style={{ color: tone.color }}
        >
          {tone.label}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${sliderClass} h-2 w-full cursor-pointer appearance-none rounded-full`}
          style={{
            background: "linear-gradient(to right, #2E7D32, #1565C0, #FF8A00, #E53935)",
          }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${sliderClass}::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: white;
              border: 3px solid ${tone.color};
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
              cursor: pointer;
              transition: border-color 0.2s;
            }
            .${sliderClass}::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: white;
              border: 3px solid ${tone.color};
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
              cursor: pointer;
              transition: border-color 0.2s;
            }
          `,
        }}
      />
    </div>
  );
}
