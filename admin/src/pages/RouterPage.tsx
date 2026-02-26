import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Types ── */
interface CostGuard {
  id: string;
  label: string;
  value: string;
  unit: string;
  color: string;
}

interface RouteRecord {
  id: string;
  taskType: string;
  sceneType: string;
  primaryModel: string;
  fallbackModel: string;
  maxCost: number;
  maxLatency: number;
  active: boolean;
}

interface FallbackNode {
  label: string;
  sublabel: string;
  color: string;
}

/* ── Static data ── */
const costGuards: CostGuard[] = [
  { id: "cg1", label: "月度预算", value: "$100", unit: "/月", color: "#FBBF24" },
  { id: "cg2", label: "单次上限", value: "$0.02", unit: "", color: "#EF4444" },
  { id: "cg3", label: "超时限制", value: "5000", unit: "ms", color: "#3B82F6" },
];

const TASK_CN: Record<string, string> = {
  TRANSLATION: "翻译", REPLY: "回复", RISK: "风险", LEARN: "教学", SCAN: "扫描",
};
const SCENE_CN: Record<string, string> = {
  GENERAL: "通用", BUSINESS: "商务", STAFF: "员工", COUPLE: "情侣",
  RENT: "租房", RESTAURANT: "餐厅", HOSPITAL: "医院", HOUSEKEEPING: "家政",
};
const taskColors: Record<string, { color: string; bg: string }> = {
  TRANSLATION: { color: "#3B82F6", bg: "#3B82F620" },
  REPLY: { color: "#A855F7", bg: "#A855F720" },
  RISK: { color: "#EF4444", bg: "#EF444420" },
  LEARN: { color: "#22C55E", bg: "#22C55E20" },
  SCAN: { color: "#FBBF24", bg: "#FBBF2420" },
};

const fallbackChain: FallbackNode[] = [
  { label: "Primary", sublabel: "主模型", color: "#3B82F6" },
  { label: "Fallback", sublabel: "备选模型", color: "#A855F7" },
  { label: "Emergency", sublabel: "应急模型", color: "#FBBF24" },
  { label: "Reject", sublabel: "拒绝请求", color: "#EF4444" },
];

export default function RouterPage() {
  const toast = useToast();
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGuard, setEditingGuard] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/router");
      if (!res.ok) throw new Error("Failed to fetch routes");
      const data: RouteRecord[] = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error(err);
      toast("加载路由数据失败");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  /* ── Handlers ── */
  const toggleRoute = async (id: string) => {
    const route = routes.find((r) => r.id === id);
    if (!route) return;

    // Optimistic update
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );

    try {
      const res = await fetch("/api/admin/router", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !route.active }),
      });
      if (!res.ok) throw new Error("Failed to update route");
      toast(route.active ? "路由已禁用" : "路由已启用");
    } catch (err) {
      console.error(err);
      // Revert on failure
      setRoutes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: route.active } : r))
      );
      toast("更新路由状态失败");
    }
  };

  const handleCreateRoute = async () => {
    try {
      const res = await fetch("/api/admin/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "TRANSLATION",
          sceneType: "GENERAL",
          primaryModel: "qwen-plus",
          fallbackModel: "gpt-4o",
          maxCost: 0.003,
          maxLatency: 1000,
          active: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to create route");
      toast("新路由已创建");
      fetchRoutes();
    } catch (err) {
      console.error(err);
      toast("创建路由失败");
    }
  };

  /* ── Formatters ── */
  const formatCost = (cost: number) => `$${cost.toFixed(3)}`;
  const formatLatency = (ms: number) => `${ms}ms`;

  /* ── Loading skeleton ── */
  const LoadingSkeleton = () => (
    <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-[#27272F] rounded w-16" />
          <div className="h-4 bg-[#27272F] rounded w-20" />
          <div className="h-4 bg-[#27272F] rounded w-24" />
          <div className="h-4 bg-[#27272F] rounded w-24" />
          <div className="h-4 bg-[#27272F] rounded flex-1" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">模型路由控制</h2>
        <button
          onClick={handleCreateRoute}
          className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
        >
          + 新增路由
        </button>
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
        {loading ? (
          <LoadingSkeleton />
        ) : routes.length === 0 ? (
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl px-4 py-8 text-center text-[13px] text-[#55556A]">
            暂无路由规则
          </div>
        ) : (
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
                  const tc = taskColors[r.taskType] || { color: "#8B8B99", bg: "#2A2A35" };
                  return (
                    <tr key={r.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ color: tc.color, backgroundColor: tc.bg }}
                        >
                          {TASK_CN[r.taskType] || r.taskType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{SCENE_CN[r.sceneType] || r.sceneType}</td>
                      <td className="px-4 py-3 text-[12px] text-[#EAEAEF] font-mono">{r.primaryModel}</td>
                      <td className="px-4 py-3 text-[12px] text-[#8B8B99] font-mono">{r.fallbackModel}</td>
                      <td className="px-4 py-3 text-[12px] text-[#FBBF24]">{formatCost(r.maxCost)}</td>
                      <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{formatLatency(r.maxLatency)}</td>
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
        )}
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
