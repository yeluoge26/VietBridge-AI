"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface RiskRule {
  id: string;
  rule: string;
  category: string;
  weight: number;
  severity: string;
  action: string;
  active: boolean;
}

/* ── Static color maps ── */
const severityColors: Record<string, { color: string; bg: string }> = {
  high: { color: "#EF4444", bg: "#EF444420" },
  medium: { color: "#FBBF24", bg: "#FBBF2420" },
  low: { color: "#3B82F6", bg: "#3B82F620" },
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
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/risk-rules");
      if (!res.ok) throw new Error("Failed to fetch risk rules");
      const data: RiskRule[] = await res.json();
      setRules(data);
    } catch (err) {
      console.error(err);
      toast("加载风控规则失败");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  /* ── Handlers ── */
  const toggleRule = async (id: string) => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;

    // Optimistic update
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );

    try {
      const res = await fetch("/api/admin/risk-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !rule.active }),
      });
      if (!res.ok) throw new Error("Failed to update rule");
      toast(rule.active ? "规则已禁用" : "规则已启用");
    } catch (err) {
      console.error(err);
      // Revert on failure
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: rule.active } : r))
      );
      toast("更新规则状态失败");
    }
  };

  const handleDelete = async (id: string) => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) return;

    // Optimistic update
    setRules((prev) => prev.filter((r) => r.id !== id));

    try {
      const res = await fetch("/api/admin/risk-rules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete rule");
      toast("规则已删除");
    } catch (err) {
      console.error(err);
      // Revert on failure
      setRules((prev) => [...prev, rule]);
      toast("删除规则失败");
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/risk-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule: "new_rule",
          category: "价格异常",
          weight: 0.1,
          severity: "低",
          action: "warn",
          active: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to create rule");
      toast("新规则已创建");
      fetchRules();
    } catch (err) {
      console.error(err);
      toast("创建规则失败");
    }
  };

  /* ── Computed summary metrics ── */
  const summaryMetrics = [
    { label: "规则总数", value: String(rules.length), color: "#3B82F6" },
    { label: "活跃规则", value: String(rules.filter((r) => r.active).length), color: "#22C55E" },
    { label: "高危规则", value: String(rules.filter((r) => r.severity === "高" || r.severity === "high").length), color: "#EF4444" },
    { label: "已禁用", value: String(rules.filter((r) => !r.active).length), color: "#FBBF24" },
  ];

  /* ── Loading skeleton ── */
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 animate-pulse">
            <div className="h-3 bg-[#27272F] rounded w-16 mb-3" />
            <div className="h-6 bg-[#27272F] rounded w-12" />
          </div>
        ))}
      </div>
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-[#27272F] rounded w-24" />
            <div className="h-4 bg-[#27272F] rounded w-16" />
            <div className="h-4 bg-[#27272F] rounded w-12" />
            <div className="h-4 bg-[#27272F] rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#EAEAEF]">风控引擎</h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">风控引擎</h2>
        <button
          onClick={handleCreate}
          className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
        >
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
      {rules.length === 0 ? (
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl px-4 py-8 text-center text-[13px] text-[#55556A]">
          暂无风控规则
        </div>
      ) : (
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#2A2A35]">
                {["规则名称", "类别", "权重", "严重性", "动作", "状态", "操作"].map((h) => (
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
                      <span className="text-[12px] font-mono font-medium text-[#EAEAEF]">{rule.rule}</span>
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
                      {rule.action}
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
      )}
    </div>
  );
}
