"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface PlanStat {
  plan: string;
  count: number;
  color: string;
  label: string;
  price: string;
  limit: string;
}

interface ModelUsageItem {
  model: string;
  calls: number;
  tokens: number;
  cost: number;
  planType: "FREE" | "PRO" | "API";
}

interface RevenueData {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  planBreakdown: PlanStat[];
  modelUsageByPlan?: ModelUsageItem[];
}

const PLAN_CONFIG: Record<string, { color: string; label: string; price: string; limit: string }> = {
  FREE: { color: "#8B8B99", label: "免费版", price: "¥0", limit: "10次/天" },
  PRO: { color: "#3B82F6", label: "专业版", price: "¥49/月", limit: "999次/天" },
  API: { color: "#FBBF24", label: "API", price: "按量", limit: "无限" },
};

export default function BillPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageTab, setUsageTab] = useState<"FREE" | "PAID">("FREE");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/billing");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch billing data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2A2A35] border-t-[#3B82F6]" />
      </div>
    );
  }

  const planBreakdown = data?.planBreakdown || [];
  const estimatedMRR = planBreakdown.reduce((sum, p) => {
    if (p.plan === "PRO") return sum + p.count * 49;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">计费管理</h2>
        <button
          onClick={fetchData}
          className="px-3 py-1.5 bg-[#2A2A35] rounded-lg text-[11px] font-medium text-[#EAEAEF] hover:bg-[#333340] transition-all cursor-pointer"
        >
          刷新
        </button>
      </div>

      {/* Revenue overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4">
          <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">总用户</div>
          <div className="text-[24px] font-bold text-[#EAEAEF]">{data?.totalUsers || 0}</div>
        </div>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4">
          <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">付费用户</div>
          <div className="text-[24px] font-bold text-[#22C55E]">{data?.paidUsers || 0}</div>
        </div>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4">
          <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">免费用户</div>
          <div className="text-[24px] font-bold text-[#8B8B99]">{data?.freeUsers || 0}</div>
        </div>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4">
          <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">预估 MRR</div>
          <div className="text-[24px] font-bold text-[#FBBF24]">¥{estimatedMRR}</div>
        </div>
      </div>

      {/* Plan breakdown */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">套餐分布</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(PLAN_CONFIG).map(([planId, config]) => {
            const stat = planBreakdown.find((p) => p.plan === planId);
            const count = stat?.count || 0;
            const pct =
              data?.totalUsers && data.totalUsers > 0
                ? Math.round((count / data.totalUsers) * 100)
                : 0;

            return (
              <div
                key={planId}
                className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                  <span className="text-[11px] text-[#55556A]">{config.price}</span>
                </div>
                <div className="text-[24px] font-bold text-[#EAEAEF] mb-1">{count}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#2A2A35] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#55556A]">{pct}%</span>
                </div>
                <div className="text-[10px] text-[#55556A] mt-2">{config.limit}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion funnel */}
      {data && data.totalUsers > 0 && (
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">转化漏斗</h3>
          <div className="space-y-3">
            {[
              { label: "注册用户", count: data.totalUsers, color: "#8B8B99" },
              {
                label: "付费用户",
                count: data.paidUsers,
                color: "#22C55E",
              },
            ].map((step) => {
              const pct = Math.round((step.count / data.totalUsers) * 100);
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="w-20 text-[11px] text-[#8B8B99]">{step.label}</span>
                  <div className="flex-1 h-3 bg-[#2A2A35] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: step.color,
                      }}
                    />
                  </div>
                  <span className="w-16 text-right text-[11px] text-[#EAEAEF]">
                    {step.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 模型使用量分布 ── */}
      {(() => {
        const allUsage = data?.modelUsageByPlan || [];
        const filtered = usageTab === "FREE"
          ? allUsage.filter((u) => u.planType === "FREE")
          : allUsage.filter((u) => u.planType === "PRO" || u.planType === "API");
        const totalCalls = filtered.reduce((s, u) => s + u.calls, 0);

        return (
          <div>
            <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">模型使用量分布</h3>
            {/* Tab buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setUsageTab("FREE")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  usageTab === "FREE"
                    ? "bg-[#3B82F6] text-white"
                    : "bg-[#2A2A35] text-[#8B8B99] hover:bg-[#333340]"
                }`}
              >
                免费用户
              </button>
              <button
                onClick={() => setUsageTab("PAID")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  usageTab === "PAID"
                    ? "bg-[#3B82F6] text-white"
                    : "bg-[#2A2A35] text-[#8B8B99] hover:bg-[#333340]"
                }`}
              >
                付费用户
              </button>
            </div>

            <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[#55556A]">暂无数据</div>
              ) : (
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="border-b border-[#2A2A35]">
                      {["模型", "调用次数", "Tokens", "成本($)", "占比"].map((h) => (
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
                    {filtered.map((u) => {
                      const pct = totalCalls > 0 ? Math.round((u.calls / totalCalls) * 100) : 0;
                      return (
                        <tr key={u.model} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                          <td className="px-4 py-3 text-[12px] text-[#EAEAEF] font-mono">{u.model}</td>
                          <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{u.calls.toLocaleString()}</td>
                          <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{u.tokens.toLocaleString()}</td>
                          <td className="px-4 py-3 text-[12px] text-[#FBBF24]">${u.cost.toFixed(2)}</td>
                          <td className="px-4 py-3 w-[180px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-[#2A2A35] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#3B82F6] to-[#A855F7] rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-[#55556A] w-8 text-right">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
