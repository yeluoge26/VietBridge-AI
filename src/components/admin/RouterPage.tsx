"use client";

import { useState, useEffect, useCallback } from "react";

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
  userLevel: number;
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

const LEVEL_LABELS: Record<number, string> = {
  0: "全部", 1: "L1", 2: "L2", 3: "L3", 4: "L4", 5: "L5", 6: "L6",
};

const TASK_OPTIONS = Object.entries(TASK_CN).map(([value, label]) => ({ value, label }));
const SCENE_OPTIONS = Object.entries(SCENE_CN).map(([value, label]) => ({ value, label }));
const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value: Number(value), label }));

const fallbackChain: FallbackNode[] = [
  { label: "Primary", sublabel: "主模型", color: "#3B82F6" },
  { label: "Fallback", sublabel: "备选模型", color: "#A855F7" },
  { label: "Emergency", sublabel: "应急模型", color: "#FBBF24" },
  { label: "Reject", sublabel: "拒绝请求", color: "#EF4444" },
];

/* ── Default form values for modal ── */
const EMPTY_FORM = {
  taskType: "TRANSLATION",
  sceneType: "GENERAL",
  primaryModel: "",
  fallbackModel: "",
  maxCost: 0.003,
  maxLatency: 1000,
  userLevel: 0,
  active: true,
};

interface RouterPageProps {
  toast: (msg: string) => void;
}

export default function RouterPage({ toast }: RouterPageProps) {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGuard, setEditingGuard] = useState<string | null>(null);

  /* ── Modal state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalRouteId, setModalRouteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

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

  const openCreateModal = () => {
    setModalMode("create");
    setModalRouteId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEditModal = (r: RouteRecord) => {
    setModalMode("edit");
    setModalRouteId(r.id);
    setForm({
      taskType: r.taskType,
      sceneType: r.sceneType,
      primaryModel: r.primaryModel,
      fallbackModel: r.fallbackModel,
      maxCost: r.maxCost,
      maxLatency: r.maxLatency,
      userLevel: r.userLevel ?? 0,
      active: r.active,
    });
    setModalOpen(true);
  };

  const handleModalSave = async () => {
    setSaving(true);
    try {
      if (modalMode === "edit" && modalRouteId) {
        const res = await fetch("/api/admin/router", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: modalRouteId, ...form }),
        });
        if (!res.ok) throw new Error("Failed to update route");
        toast("路由已更新");
      } else {
        const res = await fetch("/api/admin/router", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to create route");
        toast("新路由已创建");
      }
      setModalOpen(false);
      fetchRoutes();
    } catch (err) {
      console.error(err);
      toast(modalMode === "edit" ? "更新路由失败" : "创建路由失败");
    } finally {
      setSaving(false);
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
          onClick={openCreateModal}
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
                  {["任务", "场景", "级别", "主模型", "备选模型", "最大成本", "最大延迟", "状态", "操作"].map((h) => (
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
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-[#8B8B99] bg-[#27272F]">
                          {LEVEL_LABELS[r.userLevel ?? 0] || `L${r.userLevel}`}
                        </span>
                      </td>
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
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEditModal(r)}
                          className="rounded px-2 py-1 text-[11px] text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 cursor-pointer"
                        >
                          编辑
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

      {/* ── Edit / Create Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModalOpen(false)}>
          <div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-xl border border-[#27272F] bg-[#18181C] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#EAEAEF]">
                {modalMode === "edit" ? "编辑路由" : "新增路由"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#55556A] hover:text-[#EAEAEF] text-lg cursor-pointer">
                x
              </button>
            </div>

            <div className="space-y-4">
              {/* Row: taskType + sceneType */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">任务类型</label>
                  <select
                    value={form.taskType}
                    onChange={(e) => setForm({ ...form, taskType: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {TASK_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">场景类型</label>
                  <select
                    value={form.sceneType}
                    onChange={(e) => setForm({ ...form, sceneType: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {SCENE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: primaryModel + fallbackModel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">主模型</label>
                  <input
                    value={form.primaryModel}
                    onChange={(e) => setForm({ ...form, primaryModel: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                    placeholder="例: Qwen 7B"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">备选模型</label>
                  <input
                    value={form.fallbackModel}
                    onChange={(e) => setForm({ ...form, fallbackModel: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                    placeholder="例: Qwen 14B"
                  />
                </div>
              </div>

              {/* Row: maxCost + maxLatency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">最大成本 ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={form.maxCost}
                    onChange={(e) => setForm({ ...form, maxCost: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">最大延迟 (ms)</label>
                  <input
                    type="number"
                    step="100"
                    value={form.maxLatency}
                    onChange={(e) => setForm({ ...form, maxLatency: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  />
                </div>
              </div>

              {/* Row: userLevel */}
              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">用户级别</label>
                <select
                  value={form.userLevel}
                  onChange={(e) => setForm({ ...form, userLevel: Number(e.target.value) })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                >
                  {LEVEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label} {o.value === 0 ? "(所有用户)" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Active checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[12px] text-[#8B8B99]">启用路由</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-[#27272F] px-4 py-2 text-[12px] text-[#8B8B99] hover:bg-[#27272F] cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleModalSave}
                disabled={saving}
                className="rounded-lg bg-[#3B82F6] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#2563EB] disabled:opacity-50 cursor-pointer"
              >
                {saving ? "保存中..." : modalMode === "edit" ? "更新" : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
