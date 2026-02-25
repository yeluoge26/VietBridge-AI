"use client";

import React from "react";

interface RiskGaugeProps {
  score: number;
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine color classes and label based on score
  let strokeColor: string;
  let textColorClass: string;
  let label: string;
  if (clampedScore >= 70) {
    strokeColor = "#E53935";
    textColorClass = "text-[#E53935]";
    label = "高风险";
  } else if (clampedScore >= 40) {
    strokeColor = "#FF8A00";
    textColorClass = "text-[#FF8A00]";
    label = "中等";
  } else {
    strokeColor = "#2E7D32";
    textColorClass = "text-[#2E7D32]";
    label = "低风险";
  }

  // SVG circle parameters
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="flex flex-col items-center py-3">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EDEDED"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score number centered inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${textColorClass}`}>
            {clampedScore}
          </span>
          <span className={`mt-0.5 text-xs font-semibold ${textColorClass}`}>
            {label}
          </span>
        </div>
      </div>
      {/* Bottom label */}
      <p className="mt-2 text-xs text-[#999]">
        风险评分 {clampedScore}/100
      </p>
    </div>
  );
}
