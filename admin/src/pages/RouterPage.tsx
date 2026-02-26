import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Types ── */
interface RouteRecord {
  id: string;
  taskType: string;
  sceneType: string;
  primaryModel: string;
  fallbackModel: string | null;
  apiBase: string;
  apiKeyEnv: string;
  maxCost: number;
  maxLatency: number;
  active: boolean;
  userLevel?: number;
}

interface RouteForm {
  taskType: string;
  sceneType: string;
  primaryModel: string;
  fallbackModel: string;
  apiBase: string;
  apiKeyEnv: string;
  maxCost: string;
  maxLatency: string;
  active: boolean;
  userLevel: string;
}

/* ── Constants ── */
const TASK_OPTIONS = [
  { value: "TRANSLATION", label: "翻译" },
  { value: "REPLY", label: "回复" },
  { value: "RISK", label: "风险" },
  { value: "LEARN", label: "教学" },
  { value: "SCAN", label: "扫描" },
];

const SCENE_OPTIONS = [
  { value: "GENERAL", label: "通用" },
  { value: "BUSINESS", label: "商务" },
  { value: "STAFF", label: "员工" },
  { value: "COUPLE", label: "情侣" },
  { value: "RESTAURANT", label: "餐厅" },
  { value: "RENT", label: "租房" },
  { value: "HOSPITAL", label: "医院" },
  { value: "HOUSEKEEPING", label: "家政" },
];

const TASK_CN: Record<string, string> = Object.fromEntries(TASK_OPTIONS.map((o) => [o.value, o.label]));
const SCENE_CN: Record<string, string> = Object.fromEntries(SCENE_OPTIONS.map((o) => [o.value, o.label]));

const taskColors: Record<string, { color: string; bg: string }> = {
  TRANSLATION: { color: "#3B82F6", bg: "#3B82F620" },
  REPLY: { color: "#A855F7", bg: "#A855F720" },
  RISK: { color: "#EF4444", bg: "#EF444420" },
  LEARN: { color: "#22C55E", bg: "#22C55E20" },
  SCAN: { color: "#FBBF24", bg: "#FBBF2420" },
};

const USER_LEVELS = [
  { value: "0", label: "全部等级" },
  { value: "1", label: "Lv1" },
  { value: "2", label: "Lv2" },
  { value: "3", label: "Lv3" },
  { value: "4", label: "Lv4" },
  { value: "5", label: "Lv5" },
  { value: "6", label: "Lv6" },
];

const fallbackChain = [
  { label: "Primary", sublabel: "主模型", color: "#3B82F6" },
  { label: "Fallback", sublabel: "备选模型", color: "#A855F7" },
  { label: "Emergency", sublabel: "应急模型", color: "#FBBF24" },
  { label: "Reject", sublabel: "拒绝请求", color: "#EF4444" },
];

const emptyForm: RouteForm = {
  taskType: "TRANSLATION",
  sceneType: "GENERAL",
  primaryModel: "qwen-plus",
  fallbackModel: "gpt-4o",
  apiBase: "",
  apiKeyEnv: "",
  maxCost: "0.01",
  maxLatency: "5000",
  active: true,
  userLevel: "0",
};

const inputCls =
  "w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF] focus:border-[#3B82F6] focus:outline-none";
const selectCls = inputCls + " appearance-none";
const labelCls = "block text-[11px] text-[#8B8B99] mb-1";

export default function RouterPage() {
  const toast = useToast();
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RouteForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  /* Delete confirm */
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/router");
      if (!res.ok) throw new Error("Failed");
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

  /* ── Open modal ── */
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (r: RouteRecord) => {
    setEditingId(r.id);
    setForm({
      taskType: r.taskType,
      sceneType: r.sceneType,
      primaryModel: r.primaryModel,
      fallbackModel: r.fallbackModel ?? "",
      apiBase: r.apiBase || "",
      apiKeyEnv: r.apiKeyEnv || "",
      maxCost: String(r.maxCost),
      maxLatency: String(r.maxLatency),
      active: r.active,
      userLevel: String(r.userLevel ?? 0),
    });
    setModalOpen(true);
  };

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        taskType: form.taskType,
        sceneType: form.sceneType,
        primaryModel: form.primaryModel,
        fallbackModel: form.fallbackModel || null,
        apiBase: form.apiBase || "",
        apiKeyEnv: form.apiKeyEnv || "",
        maxCost: parseFloat(form.maxCost) || 0.01,
        maxLatency: parseInt(form.maxLatency) || 5000,
        active: form.active,
        userLevel: parseInt(form.userLevel) || 0,
      };

      const res = await fetch("/api/admin/router", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "保存失败");
      }

      toast(editingId ? "路由已更新" : "路由已创建");
      setModalOpen(false);
      fetchRoutes();
    } catch (err) {
      toast(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  /* ── Toggle ── */
  const toggleRoute = async (id: string) => {
    const route = routes.find((r) => r.id === id);
    if (!route) return;
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    try {
      const res = await fetch("/api/admin/router", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !route.active }),
      });
      if (!res.ok) throw new Error();
      toast(route.active ? "路由已禁用" : "路由已启用");
    } catch {
      setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, active: route.active } : r)));
      toast("更新状态失败");
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/admin/router", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast("路由已删除");
      setDeleteId(null);
      fetchRoutes();
    } catch {
      toast("删除失败");
    }
  };

  const formatCost = (cost: number) => `$${cost.toFixed(3)}`;
  const formatLatency = (ms: number) => `${ms}ms`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">模型路由控制</h2>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
        >
          + 新增路由
        </button>
      </div>

      {/* ── 路由表 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">路由表</h3>
        {loading ? (
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 bg-[#27272F] rounded w-16" />
                <div className="h-4 bg-[#27272F] rounded w-20" />
                <div className="h-4 bg-[#27272F] rounded w-24" />
                <div className="h-4 bg-[#27272F] rounded flex-1" />
              </div>
            ))}
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl px-4 py-8 text-center text-[13px] text-[#55556A]">
            暂无路由规则，点击「+ 新增路由」创建
          </div>
        ) : (
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-[#2A2A35]">
                  {["任务", "场景", "等级", "主模型", "备选模型", "API端点", "成本上限", "延迟上限", "状态", "操作"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider">
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
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ color: tc.color, backgroundColor: tc.bg }}
                        >
                          {TASK_CN[r.taskType] || r.taskType}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#EAEAEF]">{SCENE_CN[r.sceneType] || r.sceneType}</td>
                      <td className="px-3 py-3 text-[12px] text-[#8B8B99]">{r.userLevel === 0 ? "全部" : `Lv${r.userLevel}`}</td>
                      <td className="px-3 py-3 text-[12px] text-[#EAEAEF] font-mono">{r.primaryModel}</td>
                      <td className="px-3 py-3 text-[12px] text-[#8B8B99] font-mono">{r.fallbackModel || "—"}</td>
                      <td className="px-3 py-3 text-[11px] text-[#55556A] max-w-[120px] truncate" title={r.apiBase || "默认"}>{r.apiBase || "默认"}</td>
                      <td className="px-3 py-3 text-[12px] text-[#FBBF24]">{formatCost(r.maxCost)}</td>
                      <td className="px-3 py-3 text-[12px] text-[#8B8B99]">{formatLatency(r.maxLatency)}</td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleRoute(r.id)}
                          className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${r.active ? "bg-[#3B82F6]" : "bg-[#2A2A35]"}`}
                          role="switch"
                          aria-checked={r.active}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${r.active ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="px-2 py-1 rounded text-[10px] font-medium text-[#3B82F6] bg-[#3B82F620] hover:bg-[#3B82F630] transition-colors cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => setDeleteId(r.id)}
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

      {/* ── 降级链 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">降级链</h3>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
          <div className="flex items-center justify-center gap-2">
            {fallbackChain.map((node, idx) => (
              <div key={node.label} className="flex items-center gap-2">
                <div
                  className="rounded-lg px-4 py-3 text-center min-w-[100px]"
                  style={{ backgroundColor: `${node.color}10`, border: `1px solid ${node.color}30` }}
                >
                  <div className="text-[12px] font-semibold" style={{ color: node.color }}>{node.label}</div>
                  <div className="text-[10px] text-[#55556A] mt-0.5">{node.sublabel}</div>
                </div>
                {idx < fallbackChain.length - 1 && (
                  <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
                    <path d="M0 8h26M22 4l4 4-4 4" stroke={fallbackChain[idx + 1].color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ Edit / Create Modal ══════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#111114] border border-[#27272F] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-[15px] font-bold text-[#EAEAEF] mb-5">
              {editingId ? "编辑路由" : "新增路由"}
            </h3>

            <div className="space-y-4">
              {/* Task + Scene */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>任务类型</label>
                  <select value={form.taskType} onChange={(e) => setForm({ ...form, taskType: e.target.value })} className={selectCls}>
                    {TASK_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>场景</label>
                  <select value={form.sceneType} onChange={(e) => setForm({ ...form, sceneType: e.target.value })} className={selectCls}>
                    {SCENE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
              </div>

              {/* Primary + Fallback */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>主模型</label>
                  <input value={form.primaryModel} onChange={(e) => setForm({ ...form, primaryModel: e.target.value })} className={inputCls} placeholder="例: qwen-plus" />
                </div>
                <div>
                  <label className={labelCls}>备选模型</label>
                  <input value={form.fallbackModel} onChange={(e) => setForm({ ...form, fallbackModel: e.target.value })} className={inputCls} placeholder="例: gpt-4o" />
                </div>
              </div>

              {/* API Base + API Key Env */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>API Base URL</label>
                  <input value={form.apiBase} onChange={(e) => setForm({ ...form, apiBase: e.target.value })} className={inputCls} placeholder="留空使用默认端点" />
                </div>
                <div>
                  <label className={labelCls}>API Key 环境变量</label>
                  <input value={form.apiKeyEnv} onChange={(e) => setForm({ ...form, apiKeyEnv: e.target.value })} className={inputCls} placeholder="例: OPENAI_API_KEY" />
                </div>
              </div>

              {/* Cost + Latency + Level */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>成本上限 ($)</label>
                  <input type="number" step="0.001" value={form.maxCost} onChange={(e) => setForm({ ...form, maxCost: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>延迟上限 (ms)</label>
                  <input type="number" step="100" value={form.maxLatency} onChange={(e) => setForm({ ...form, maxLatency: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>用户等级</label>
                  <select value={form.userLevel} onChange={(e) => setForm({ ...form, userLevel: e.target.value })} className={selectCls}>
                    {USER_LEVELS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <label className="text-[11px] text-[#8B8B99]">启用状态</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${form.active ? "bg-[#3B82F6]" : "bg-[#2A2A35]"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.active ? "translate-x-4" : "translate-x-0"}`} />
                </button>
                <span className="text-[11px] text-[#EAEAEF]">{form.active ? "已启用" : "已禁用"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] border border-[#27272F] hover:bg-[#18181C] transition-colors cursor-pointer">
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.primaryModel.trim()}
                className="px-4 py-2 rounded-lg text-[12px] font-medium text-white bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:opacity-40 transition-all cursor-pointer"
              >
                {saving ? "保存中…" : editingId ? "保存修改" : "创建路由"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Delete Confirm ══════════ */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[#111114] border border-[#27272F] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-[15px] font-bold text-[#EAEAEF] mb-3">确认删除</h3>
            <p className="text-[12px] text-[#8B8B99] mb-5">删除后无法恢复，确定要删除该路由规则吗？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] border border-[#27272F] hover:bg-[#18181C] transition-colors cursor-pointer">
                取消
              </button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 rounded-lg text-[12px] font-medium text-white bg-[#EF4444] hover:bg-[#EF4444]/90 transition-all cursor-pointer">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
