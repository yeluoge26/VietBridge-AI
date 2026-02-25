"use client";

import { useState } from "react";

/* ── Types ── */
interface CostGuard {
  id: string;
  label: string;
  value: string;
  unit: string;
  color: string;
}

interface Route {
  id: string;
  task: string;
  scene: string;
  primary: string;
  fallback: string;
  maxCost: string;
  maxLatency: string;
  active: boolean;
}

interface FallbackNode {
  label: string;
  sublabel: string;
  color: string;
}

/* ── Mock data ── */
const costGuards: CostGuard[] = [
  { id: "cg1", label: "月度预算", value: "$100", unit: "/月", color: "#FBBF24" },
  { id: "cg2", label: "单次上限", value: "$0.02", unit: "", color: "#EF4444" },
  { id: "cg3", label: "超时限制", value: "5000", unit: "ms", color: "#3B82F6" },
];

const initialRoutes: Route[] = [
  { id: "r1", task: "翻译", scene: "通用", primary: "Qwen 7B", fallback: "Qwen 14B", maxCost: "$0.003", maxLatency: "1000ms", active: true },
  { id: "r2", task: "翻译", scene: "合同", primary: "GPT-4o", fallback: "Claude-3.5", maxCost: "$0.02", maxLatency: "3000ms", active: true },
  { id: "r3", task: "风险", scene: "租房", primary: "GPT-4o", fallback: "Qwen 14B", maxCost: "$0.015", maxLatency: "2500ms", active: true },
  { id: "r4", task: "风险", scene: "诈骗", primary: "GPT-4o", fallback: "Claude-3.5", maxCost: "$0.02", maxLatency: "3000ms", active: true },
  { id: "r5", task: "回复", scene: "客服", primary: "Qwen 14B", fallback: "Qwen 7B", maxCost: "$0.005", maxLatency: "1500ms", active: true },
  { id: "r6", task: "教学", scene: "基础", primary: "Qwen 7B", fallback: "Qwen 14B", maxCost: "$0.003", maxLatency: "1000ms", active: true },
  { id: "r7", task: "扫描", scene: "发票", primary: "Claude-3.5", fallback: "GPT-4o", maxCost: "$0.02", maxLatency: "3000ms", active: false },
  { id: "r8", task: "翻译", scene: "电商", primary: "Qwen 14B", fallback: "GPT-4o", maxCost: "$0.01", maxLatency: "2000ms", active: true },
];

const taskColors: Record<string, { color: string; bg: string }> = {
  翻译: { color: "#3B82F6", bg: "#3B82F620" },
  回复: { color: "#A855F7", bg: "#A855F720" },
  风险: { color: "#EF4444", bg: "#EF444420" },
  教学: { color: "#22C55E", bg: "#22C55E20" },
  扫描: { color: "#FBBF24", bg: "#FBBF2420" },
};

const fallbackChain: FallbackNode[] = [
  { label: "Primary", sublabel: "主模型", color: "#3B82F6" },
  { label: "Fallback", sublabel: "备选模型", color: "#A855F7" },
  { label: "Emergency", sublabel: "应急模型", color: "#FBBF24" },
  { label: "Reject", sublabel: "拒绝请求", color: "#EF4444" },
];

interface RouterPageProps {
  toast: (msg: string) => void;
}

export default function RouterPage({ toast }: RouterPageProps) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [editingGuard, setEditingGuard] = useState<string | null>(null);

  const toggleRoute = (id: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">模型路由控制</h2>
      </div>

      {/* ── 成本防护 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">成本防护</h3>
        <div className="grid grid-cols-3 gap-4">
          {costGuards.map((g) => (
            <div
              key={g.id}
              className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 hover:border-[#333340] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#55556A] uppercase tracking-wider">{g.label}</span>
                <button
                  onClick={() => setEditingGuard(editingGuard === g.id ? null : g.id)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium text-[#3B82F6] bg-[#3B82F620] hover:bg-[#3B82F630] transition-colors cursor-pointer"
                >
                  编辑
                </button>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-bold" style={{ color: g.color }}>
                  {g.value}
                </span>
                {g.unit && <span className="text-[12px] text-[#55556A]">{g.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 路由表 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">路由表</h3>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#2A2A35]">
                {["任务", "场景", "主模型", "备选模型", "最大成本", "最大延迟", "状态"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const tc = taskColors[r.task] || { color: "#8B8B99", bg: "#2A2A35" };
                return (
                  <tr key={r.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ color: tc.color, backgroundColor: tc.bg }}
                      >
                        {r.task}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{r.scene}</td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF] font-mono">{r.primary}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8B8B99] font-mono">{r.fallback}</td>
                    <td className="px-4 py-3 text-[12px] text-[#FBBF24]">{r.maxCost}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{r.maxLatency}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRoute(r.id)}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                          r.active ? "bg-[#3B82F6]" : "bg-[#2A2A35]"
                        }`}
                        role="switch"
                        aria-checked={r.active}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                            r.active ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 降级链 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">降级链</h3>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
          <div className="flex items-center justify-center gap-2">
            {fallbackChain.map((node, idx) => (
              <div key={node.label} className="flex items-center gap-2">
                {/* Node */}
                <div
                  className="rounded-lg px-4 py-3 text-center min-w-[100px]"
                  style={{
                    backgroundColor: `${node.color}10`,
                    border: `1px solid ${node.color}30`,
                  }}
                >
                  <div className="text-[12px] font-semibold" style={{ color: node.color }}>
                    {node.label}
                  </div>
                  <div className="text-[10px] text-[#55556A] mt-0.5">{node.sublabel}</div>
                </div>
                {/* Arrow */}
                {idx < fallbackChain.length - 1 && (
                  <div className="flex items-center">
                    <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                      <path
                        d="M0 8h26M22 4l4 4-4 4"
                        stroke={fallbackChain[idx + 1].color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
