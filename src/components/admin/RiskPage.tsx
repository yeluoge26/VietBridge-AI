"use client";

import { useState } from "react";

/* ── Types ── */
interface RiskRule {
  id: string;
  name: string;
  category: string;
  weight: number;
  severity: "高" | "中" | "低";
  condition: string;
  active: boolean;
}

/* ── Mock data ── */
const summaryMetrics = [
  { label: "规则总数", value: "12", color: "#3B82F6" },
  { label: "今日触发", value: "47", color: "#FBBF24" },
  { label: "误报率", value: "3.2%", color: "#EF4444" },
  { label: "平均耗时", value: "12ms", color: "#22C55E" },
];

const initialRules: RiskRule[] = [
  { id: "rr1", name: "price_check", category: "价格异常", weight: 0.3, severity: "高", condition: "price_deviation > 50% of market_average", active: true },
  { id: "rr2", name: "contract_clause", category: "合同陷阱", weight: 0.25, severity: "高", condition: "missing_clauses in [termination, deposit] OR unfair_terms detected", active: true },
  { id: "rr3", name: "scam_pattern", category: "诈骗模式", weight: 0.2, severity: "高", condition: "match_score >= 0.75 against known_scam_db", active: true },
  { id: "rr4", name: "tone_escalation", category: "语气升级", weight: 0.15, severity: "中", condition: "sentiment_delta > 0.4 in consecutive_messages", active: true },
  { id: "rr5", name: "cultural_conflict", category: "文化冲突", weight: 0.1, severity: "低", condition: "cultural_sensitivity_score > 0.6 AND context = cross_border", active: false },
];

const severityColors: Record<string, { color: string; bg: string }> = {
  高: { color: "#EF4444", bg: "#EF444420" },
  中: { color: "#FBBF24", bg: "#FBBF2420" },
  低: { color: "#3B82F6", bg: "#3B82F620" },
};

const categoryColors: Record<string, { color: string; bg: string }> = {
  价格异常: { color: "#FBBF24", bg: "#FBBF2420" },
  合同陷阱: { color: "#A855F7", bg: "#A855F720" },
  诈骗模式: { color: "#EF4444", bg: "#EF444420" },
  语气升级: { color: "#F97316", bg: "#F9731620" },
  文化冲突: { color: "#06B6D4", bg: "#06B6D420" },
};

interface RiskPageProps {
  toast: (msg: string) => void;
}

export default function RiskPage({ toast }: RiskPageProps) {
  const [rules, setRules] = useState(initialRules);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">风控引擎</h2>
        <button className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
          + 新增规则
        </button>
      </div>

      {/* ── Summary metrics ── */}
      <div className="grid grid-cols-4 gap-4">
        {summaryMetrics.map((m) => (
          <div
            key={m.label}
            className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 hover:border-[#333340] transition-all"
          >
            <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">{m.label}</div>
            <div className="text-[22px] font-bold" style={{ color: m.color }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Rules table ── */}
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr className="border-b border-[#2A2A35]">
              {["规则名称", "类别", "权重", "严重性", "触发条件", "状态", "操作"].map((h) => (
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
            {rules.map((rule) => {
              const sc = severityColors[rule.severity] || { color: "#8B8B99", bg: "#2A2A35" };
              const cc = categoryColors[rule.category] || { color: "#8B8B99", bg: "#2A2A35" };
              return (
                <tr key={rule.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-mono font-medium text-[#EAEAEF]">{rule.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ color: cc.color, backgroundColor: cc.bg }}
                    >
                      {rule.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-semibold text-[#EAEAEF]">{rule.weight}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ color: sc.color, backgroundColor: sc.bg }}
                    >
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#8B8B99] font-mono max-w-[260px] truncate">
                    {rule.condition}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                        rule.active ? "bg-[#3B82F6]" : "bg-[#2A2A35]"
                      }`}
                      role="switch"
                      aria-checked={rule.active}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          rule.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 rounded text-[10px] font-medium text-[#3B82F6] bg-[#3B82F620] hover:bg-[#3B82F630] transition-colors cursor-pointer">
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="px-2 py-1 rounded text-[10px] font-medium text-[#EF4444] bg-[#EF444420] hover:bg-[#EF444430] transition-colors cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
