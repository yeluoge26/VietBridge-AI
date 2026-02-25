"use client";

import React from "react";

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`fixed left-1/2 top-12 z-[100] -translate-x-1/2 rounded-[10px] bg-[#111] px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 pointer-events-none opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
