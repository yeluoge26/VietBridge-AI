"use client";

import { useState } from "react";

/* ── SVG icon helpers (inline, no external deps) ── */
const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  book: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h4.5a2 2 0 012 2v10a1.5 1.5 0 00-1.5-1.5H2V2z" />
      <path d="M14 2H9.5a2 2 0 00-2 2v10A1.5 1.5 0 019 12.5H14V2z" />
    </svg>
  ),
  terminal: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l4 4-4 4" />
      <path d="M8 12h6" />
    </svg>
  ),
  "circle-nodes": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="4" cy="4" r="2" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M6 4h4M5 5.5L7 10.5M11 5.5L9 10.5" />
    </svg>
  ),
  file: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1h6l4 4v10H3V1z" />
      <path d="M9 1v4h4" />
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V4L8 1z" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <circle cx="11.5" cy="5.5" r="1.8" />
      <path d="M11.5 10c1.8 0 3.5 1.2 3.5 3.5" />
    </svg>
  ),
  "credit-card": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="1.5" />
      <path d="M1 7h14" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  ),
};

/* ── Nav structure ── */
interface NavItem {
  id: string;
  label: string;
  icon: string;
}
interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "核心",
    items: [
      { id: "dash", label: "Dashboard", icon: "grid" },
      { id: "kb", label: "知识库", icon: "book" },
      { id: "prompt", label: "Prompt", icon: "terminal" },
    ],
  },
  {
    title: "智能",
    items: [
      { id: "router", label: "模型路由", icon: "circle-nodes" },
      { id: "logs", label: "LLM日志", icon: "file" },
      { id: "risk", label: "风控引擎", icon: "shield" },
    ],
  },
  {
    title: "商业",
    items: [
      { id: "users", label: "用户分析", icon: "users" },
      { id: "bill", label: "计费", icon: "credit-card" },
    ],
  },
  {
    title: "系统",
    items: [{ id: "sys", label: "系统", icon: "settings" }],
  },
];

/* ── Component ── */
interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const costUsed = 42.4;
  const costLimit = 100;
  const costPct = (costUsed / costLimit) * 100;

  return (
    <aside
      className="flex flex-col h-screen w-[200px] min-w-[200px] bg-[#111114] border-r border-[#27272F] select-none"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-[#27272F]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L2 6v4l6 4 6-4V6L8 2z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#EAEAEF] tracking-wide">
              VietBridge
            </div>
            <div className="text-[9px] font-medium text-[#55556A] tracking-[0.15em] uppercase">
              CONTROL CENTER
            </div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="px-2 mb-1.5 text-[10px] font-medium text-[#55556A] uppercase tracking-[0.12em]">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[12px] font-medium transition-all duration-150 cursor-pointer
                      ${
                        active
                          ? "bg-[#3B82F6]/10 text-[#3B82F6] border-l-2 border-[#3B82F6] pl-2"
                          : "text-[#8B8B99] hover:text-[#EAEAEF] hover:bg-[#1E1E24] border-l-2 border-transparent"
                      }`}
                  >
                    <span className="flex-shrink-0">{icons[item.icon]}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Cost indicator */}
      <div className="px-4 py-3 border-t border-[#27272F]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[#55556A] uppercase tracking-wider">
            月成本
          </span>
          <span className="text-[12px] font-semibold text-[#F59E0B]">
            ${costUsed}
          </span>
        </div>
        <div className="h-1.5 bg-[#27272F] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#3B82F6] to-[#A855F7] rounded-full transition-all duration-500"
            style={{ width: `${costPct}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-[10px] text-[#55556A]">/ ${costLimit}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="text-[10px] text-[#55556A]">Admin v2.0</div>
      </div>
    </aside>
  );
}
