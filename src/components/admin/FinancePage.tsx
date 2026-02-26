"use client";

import { useState, useEffect, useCallback } from "react";
import Metric from "./Metric";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ── Types ── */
interface ModelPrice {
  id: string;
  modelName: string;
  displayName: string;
  provider: string;
  inputPrice: number;
  outputPrice: number;
  enabled: boolean;
}

interface MonthlyCost {
  model: string;
  cost: number;
}

interface FinanceOverview {
  totalCostThisMonth: number;
  avgDailyCost: number;
  avgCostPerCall: number;
  activeModels: number;
}

interface FinanceResponse {
  overview: FinanceOverview;
  models: ModelPrice[];
  monthlyCosts: MonthlyCost[];
}

/* ── Tooltip style ── */
const tooltipStyle = {
  contentStyle: {
    background: "#18181C",
    border: "1px solid #27272F",
    borderRadius: 8,
    fontSize: 11,
    color: "#EAEAEF",
  },
  itemStyle: { color: "#EAEAEF" },
};

const EMPTY_MODEL: Omit<ModelPrice, "id"> = {
  modelName: "",
  displayName: "",
  provider: "",
  inputPrice: 0,
  outputPrice: 0,
  enabled: true,
};

interface FinancePageProps {
  toast: (msg: string) => void;
}

export default function FinancePage({ toast }: FinancePageProps) {
  const [data, setData] = useState<FinanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Modal state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ModelPrice, "id">>({ ...EMPTY_MODEL });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance");
      if (!res.ok) throw new Error("Failed to fetch finance data");
      const json: FinanceResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast("加载财务数据失败");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Handlers ── */
  const openCreateModal = () => {
    setModalMode("create");
    setEditId(null);
    setForm({ ...EMPTY_MODEL });
    setModalOpen(true);
  };

  const openEditModal = (m: ModelPrice) => {
    setModalMode("edit");
    setEditId(m.id);
    setForm({
      modelName: m.modelName,
      displayName: m.displayName,
      provider: m.provider,
      inputPrice: m.inputPrice,
      outputPrice: m.outputPrice,
      enabled: m.enabled,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === "edit" && editId) {
        const res = await fetch("/api/admin/finance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...form }),
        });
        if (!res.ok) throw new Error("Failed to update model");
        toast("模型已更新");
      } else {
        const res = await fetch("/api/admin/finance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to create model");
        toast("模型已创建");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast(modalMode === "edit" ? "更新失败" : "创建失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该模型价格配置？")) return;
    try {
      const res = await fetch(`/api/admin/finance?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete model");
      toast("已删除");
      fetchData();
    } catch (err) {
      console.error(err);
      toast("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2A2A35] border-t-[#3B82F6]" />
      </div>
    );
  }

  const overview = data?.overview || { totalCostThisMonth: 0, avgDailyCost: 0, avgCostPerCall: 0, activeModels: 0 };
  const models = data?.models || [];
  const monthlyCosts = data?.monthlyCosts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">财务管理</h2>
        <button
          onClick={fetchData}
          className="px-3 py-1.5 bg-[#2A2A35] rounded-lg text-[11px] font-medium text-[#EAEAEF] hover:bg-[#333340] transition-all cursor-pointer"
        >
          刷新
        </button>
      </div>

      {/* ── Section 1: 本月概览 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">本月概览</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric
            label="本月总成本"
            value={overview.totalCostThisMonth.toFixed(2)}
            prefix="$"
          />
          <Metric
            label="日均成本"
            value={overview.avgDailyCost.toFixed(2)}
            prefix="$"
          />
          <Metric
            label="单次均价"
            value={overview.avgCostPerCall.toFixed(4)}
            prefix="$"
          />
          <Metric
            label="活跃模型数"
            value={overview.activeModels.toString()}
          />
        </div>
      </div>

      {/* ── Section 2: 模型价格配置 ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF]">模型价格配置</h3>
          <button
            onClick={openCreateModal}
            className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
          >
            + 新增模型
          </button>
        </div>

        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
          {models.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-[#55556A]">暂无模型配置</div>
          ) : (
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-[#2A2A35]">
                  {["模型名称", "显示名", "供应商", "输入价格(/1K)", "输出价格(/1K)", "启用", "操作"].map((h) => (
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
                {models.map((m) => (
                  <tr key={m.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF] font-mono">{m.modelName}</td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{m.displayName}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{m.provider}</td>
                    <td className="px-4 py-3 text-[12px] text-[#FBBF24]">${m.inputPrice.toFixed(4)}</td>
                    <td className="px-4 py-3 text-[12px] text-[#FBBF24]">${m.outputPrice.toFixed(4)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          m.enabled
                            ? "text-[#22C55E] bg-[#22C55E20]"
                            : "text-[#EF4444] bg-[#EF444420]"
                        }`}
                      >
                        {m.enabled ? "已启用" : "已禁用"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="rounded px-2 py-1 text-[11px] text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 cursor-pointer"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="rounded px-2 py-1 text-[11px] text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10 cursor-pointer"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Section 3: 本月成本分布 ── */}
      {monthlyCosts.length > 0 && (
        <div>
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">本月成本分布</h3>
          <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272F" />
                <XAxis
                  dataKey="model"
                  tick={{ fill: "#55556A", fontSize: 10 }}
                  axisLine={{ stroke: "#27272F" }}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: "#55556A", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} />
                <Bar
                  dataKey="cost"
                  fill="#A855F7"
                  radius={[4, 4, 0, 0]}
                  name="成本($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Edit / Create Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModalOpen(false)}>
          <div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-xl border border-[#27272F] bg-[#18181C] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#EAEAEF]">
                {modalMode === "edit" ? "编辑模型" : "新增模型"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#55556A] hover:text-[#EAEAEF] text-lg cursor-pointer">
                x
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">模型名称</label>
                <input
                  value={form.modelName}
                  onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="例: qwen-turbo"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">显示名</label>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="例: Qwen Turbo"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">供应商</label>
                <input
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="例: DashScope"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">输入价格 ($/1K tokens)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.inputPrice}
                    onChange={(e) => setForm({ ...form, inputPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">输出价格 ($/1K tokens)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.outputPrice}
                    onChange={(e) => setForm({ ...form, outputPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[12px] text-[#8B8B99]">启用</span>
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
                onClick={handleSave}
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
