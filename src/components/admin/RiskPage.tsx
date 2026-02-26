"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface RiskRule {
  id: string;
  name: string;
  rule: string;
  category: string;
  weight: number;
  severity: string;
  action: string;
  active: boolean;
}

/* ── Scene / severity / action mappings ── */
const SCENE_OPTIONS = [
  { value: "", label: "全部场景" },
  { value: "general", label: "通用" },
  { value: "business", label: "商务" },
  { value: "staff", label: "员工" },
  { value: "couple", label: "情侣" },
  { value: "rent", label: "租房" },
  { value: "restaurant", label: "餐厅" },
  { value: "hospital", label: "医院" },
  { value: "housekeeping", label: "家政" },
];

const SEVERITY_OPTIONS = [
  { value: "", label: "全部严重度" },
  { value: "criminal", label: "犯罪" },
  { value: "critical", label: "严重" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const SEVERITY_STYLE: Record<string, { color: string; bg: string }> = {
  criminal: { color: "#7C3AED", bg: "#7C3AED18" },
  critical: { color: "#DC2626", bg: "#DC262618" },
  high: { color: "#F97316", bg: "#F9731618" },
  medium: { color: "#FBBF24", bg: "#FBBF2418" },
  low: { color: "#3B82F6", bg: "#3B82F618" },
};

const SEVERITY_CN: Record<string, string> = {
  criminal: "犯罪", critical: "严重", high: "高", medium: "中", low: "低",
};

const ACTION_CN: Record<string, string> = {
  warn: "警告", block: "阻断", review: "审核",
};

const ACTION_OPTIONS = [
  { value: "warn", label: "警告 (warn)" },
  { value: "block", label: "阻断 (block)" },
  { value: "review", label: "审核 (review)" },
];

interface RiskPageProps {
  toast: (msg: string) => void;
}

export default function RiskPage({ toast }: RiskPageProps) {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [sevFilter, setSevFilter] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [sevOpen, setSevOpen] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState<RiskRule | null>(null);
  const [editName, setEditName] = useState("");
  const [editRule, setEditRule] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editSeverity, setEditSeverity] = useState("medium");
  const [editWeight, setEditWeight] = useState(5);
  const [editAction, setEditAction] = useState("warn");
  const [saving, setSaving] = useState(false);

  // New rule modal
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRule, setNewRule] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newSeverity, setNewSeverity] = useState("medium");
  const [newWeight, setNewWeight] = useState(5);
  const [newAction, setNewAction] = useState("warn");

  /* ── Fetch ── */
  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (catFilter) params.set("category", catFilter);
      if (sevFilter) params.set("severity", sevFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/risk-rules?${params}`);
      if (!res.ok) throw new Error("Failed");
      setRules(await res.json());
    } catch {
      toast("加载风控规则失败");
    } finally {
      setLoading(false);
    }
  }, [catFilter, sevFilter, search, toast]);

  useEffect(() => {
    const timer = setTimeout(fetchRules, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchRules, search]);

  useEffect(() => {
    const h = () => { setCatOpen(false); setSevOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Handlers ── */
  const handleEdit = (r: RiskRule) => {
    setEditing(r);
    setEditName(r.name);
    setEditRule(r.rule);
    setEditCategory(r.category);
    setEditSeverity(r.severity);
    setEditWeight(r.weight);
    setEditAction(r.action);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/risk-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id, name: editName, rule: editRule,
          category: editCategory, severity: editSeverity,
          weight: editWeight, action: editAction,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("保存成功");
      setEditing(null);
      fetchRules();
    } catch { toast("保存失败"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (r: RiskRule) => {
    setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, active: !x.active } : x));
    try {
      const res = await fetch("/api/admin/risk-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, active: !r.active }),
      });
      if (!res.ok) throw new Error("Failed");
      toast(r.active ? "已禁用" : "已启用");
    } catch {
      setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, active: r.active } : x));
      toast("操作失败");
    }
  };

  const handleDelete = async (r: RiskRule) => {
    if (!confirm(`确定删除规则「${r.name}」？`)) return;
    try {
      const res = await fetch(`/api/admin/risk-rules?id=${r.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast("已删除");
      fetchRules();
    } catch { toast("删除失败"); }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newRule.trim()) { toast("名称和条件不能为空"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/risk-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName, rule: newRule, category: newCategory,
          severity: newSeverity, weight: newWeight, action: newAction,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("创建成功");
      setShowNew(false);
      setNewName(""); setNewRule("");
      fetchRules();
    } catch { toast("创建失败"); }
    finally { setSaving(false); }
  };

  /* ── Dropdown ── */
  const Dropdown = ({ options, value, open, setOpen, onChange }: {
    options: { value: string; label: string }[]; value: string; open: boolean;
    setOpen: (v: boolean) => void; onChange: (v: string) => void;
  }) => (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] hover:border-[#3B82F6]/50 transition-colors cursor-pointer min-w-[110px]">
        <span>{options.find((o) => o.value === value)?.label}</span>
        <svg className="w-3 h-3 text-[#55556A] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-[#18181C] border border-[#27272F] rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden">
          {options.map((opt) => (
            <button key={opt.value} onClick={(e) => { e.stopPropagation(); onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${opt.value === value ? "bg-[#3B82F6] text-white" : "text-[#EAEAEF] hover:bg-[#27272F]"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  /* ── Summary ── */
  const activeCount = rules.filter((r) => r.active).length;
  const criticalCount = rules.filter((r) => r.severity === "critical").length;
  const highCount = rules.filter((r) => r.severity === "high").length;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <h2 className="text-[18px] font-bold text-[#EAEAEF]">风控引擎</h2>
        <p className="text-[12px] text-[#55556A] mt-1">管理风险检测规则</p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "规则总数", value: rules.length, color: "#3B82F6" },
          { label: "活跃规则", value: activeCount, color: "#22C55E" },
          { label: "严重级", value: criticalCount, color: "#DC2626" },
          { label: "高危级", value: highCount, color: "#F97316" },
        ].map((m) => (
          <div key={m.label} className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
            <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">{m.label}</div>
            <div className="text-[22px] font-bold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#55556A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索规则名称或条件..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] placeholder:text-[#55556A] focus:outline-none focus:border-[#3B82F6]/50 transition-colors"
          />
        </div>
        <Dropdown options={SCENE_OPTIONS} value={catFilter} open={catOpen} setOpen={setCatOpen} onChange={setCatFilter} />
        <Dropdown options={SEVERITY_OPTIONS} value={sevFilter} open={sevOpen} setOpen={setSevOpen} onChange={setSevFilter} />
        <button onClick={() => setShowNew(true)} className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[12px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
          + 新增规则
        </button>
        <span className="text-[11px] text-[#55556A] ml-auto">{rules.length} 条规则</span>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#18181C] border border-[#27272F] rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#27272F] border-t-[#3B82F6] rounded-full animate-spin" />
            <p className="text-[12px] text-[#55556A] mt-2">加载中…</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-[#55556A]">暂无风控规则</div>
        ) : (
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#27272F]">
                {["ID", "名称", "场景", "条件", "严重度", "权重", "动作", "状态", "操作"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((r, idx) => {
                const ss = SEVERITY_STYLE[r.severity] || { color: "#8B8B99", bg: "#27272F" };
                return (
                  <tr key={r.id} className="border-b border-[#27272F] hover:bg-[#1E1E24] transition-colors">
                    <td className="px-3 py-2.5 text-[12px] text-[#55556A]">{idx + 1}</td>
                    <td className="px-3 py-2.5 text-[12px] font-medium text-[#EAEAEF] max-w-[160px] truncate">{r.name || "-"}</td>
                    <td className="px-3 py-2.5 text-[12px] text-[#8B8B99]">{r.category}</td>
                    <td className="px-3 py-2.5 text-[12px] text-[#8B8B99] max-w-[320px] truncate" title={r.rule}>{r.rule}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold" style={{ color: ss.color, backgroundColor: ss.bg }}>
                        {SEVERITY_CN[r.severity] || r.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] font-semibold text-[#EAEAEF]">{r.weight}</td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-[#8B8B99]">{ACTION_CN[r.action] || r.action}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-medium ${r.active ? "text-[#22C55E]" : "text-[#55556A]"}`}>
                        {r.active ? "启用" : "禁用"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEdit(r)} className="px-2 py-1 rounded text-[10px] font-medium text-[#3B82F6] bg-[#3B82F618] hover:bg-[#3B82F630] transition-colors cursor-pointer">编辑</button>
                        <button onClick={() => handleToggle(r)} className="px-2 py-1 rounded text-[10px] font-medium text-[#F59E0B] bg-[#F59E0B18] hover:bg-[#F59E0B30] transition-colors cursor-pointer">
                          {r.active ? "禁用" : "启用"}
                        </button>
                        <button onClick={() => handleDelete(r)} className="px-2 py-1 rounded text-[10px] font-medium text-white bg-[#EF4444] hover:bg-[#EF4444]/80 transition-colors cursor-pointer">删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#0D0D10] border border-[#27272F] rounded-2xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-[#27272F] px-6 py-4 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#EAEAEF]">编辑规则</h3>
              <button onClick={() => setEditing(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#55556A] hover:text-[#EAEAEF] hover:bg-[#27272F] cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] text-[#55556A] mb-1 block">规则名称</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50" />
              </div>
              <div>
                <label className="text-[11px] text-[#55556A] mb-1 block">检测条件</label>
                <textarea value={editRule} onChange={(e) => setEditRule(e.target.value)} rows={3}
                  className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] font-mono resize-y focus:outline-none focus:border-[#3B82F6]/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">场景</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {SCENE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">严重度</label>
                  <select value={editSeverity} onChange={(e) => setEditSeverity(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {SEVERITY_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">权重 (1-100)</label>
                  <input type="number" min={1} max={100} value={editWeight} onChange={(e) => setEditWeight(Number(e.target.value))} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] font-mono focus:outline-none focus:border-[#3B82F6]/50" />
                </div>
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">动作</label>
                  <select value={editAction} onChange={(e) => setEditAction(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {ACTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="border-t border-[#27272F] px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] hover:text-[#EAEAEF] border border-[#27272F] cursor-pointer">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-[#3B82F6] rounded-lg text-[12px] font-medium text-white hover:bg-[#3B82F6]/90 disabled:opacity-50 cursor-pointer">
                {saving ? "保存中…" : "更新"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Rule Modal ── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-[#0D0D10] border border-[#27272F] rounded-2xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-[#27272F] px-6 py-4 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#EAEAEF]">新增规则</h3>
              <button onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#55556A] hover:text-[#EAEAEF] hover:bg-[#27272F] cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] text-[#55556A] mb-1 block">规则名称</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例：价格异常高" className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] placeholder:text-[#444] focus:outline-none focus:border-[#3B82F6]/50" />
              </div>
              <div>
                <label className="text-[11px] text-[#55556A] mb-1 block">检测条件</label>
                <textarea value={newRule} onChange={(e) => setNewRule(e.target.value)} rows={3} placeholder="例：检测到价格超过本地平均水平200%以上"
                  className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] font-mono placeholder:text-[#444] resize-y focus:outline-none focus:border-[#3B82F6]/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">场景</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {SCENE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">严重度</label>
                  <select value={newSeverity} onChange={(e) => setNewSeverity(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {SEVERITY_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">权重 (1-100)</label>
                  <input type="number" min={1} max={100} value={newWeight} onChange={(e) => setNewWeight(Number(e.target.value))} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] font-mono focus:outline-none focus:border-[#3B82F6]/50" />
                </div>
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">动作</label>
                  <select value={newAction} onChange={(e) => setNewAction(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {ACTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="border-t border-[#27272F] px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] hover:text-[#EAEAEF] border border-[#27272F] cursor-pointer">取消</button>
              <button onClick={handleCreate} disabled={saving} className="px-5 py-2 bg-[#3B82F6] rounded-lg text-[12px] font-medium text-white hover:bg-[#3B82F6]/90 disabled:opacity-50 cursor-pointer">
                {saving ? "创建中…" : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
