import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Types ── */
interface ScenePhrase {
  id: string;
  scene: string;
  vi: string;
  zh: string;
  pinyin: string;
  culture: string;
  active: boolean;
  sortOrder: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ── Scene mappings ── */
const SCENE_OPTIONS = [
  { value: "", label: "全部场景" },
  { value: "ktv", label: "KTV夜生活" },
  { value: "dirtyword", label: "吵架骂人" },
  { value: "transport", label: "交通摩托" },
  { value: "mlove", label: "情侣亲密" },
  { value: "customer", label: "消费购物" },
  { value: "pickup", label: "认识陌生人" },
  { value: "antiscam", label: "防被宰" },
];

const SCENE_CN: Record<string, string> = {
  ktv: "KTV夜生活", dirtyword: "吵架骂人", transport: "交通摩托", mlove: "情侣亲密",
  customer: "消费购物", pickup: "认识陌生人", antiscam: "防被宰",
};

const SCENE_BADGE: Record<string, { color: string; bg: string }> = {
  ktv: { color: "#9C27B0", bg: "#9C27B020" },
  dirtyword: { color: "#D32F2F", bg: "#D32F2F20" },
  transport: { color: "#FF6F00", bg: "#FF6F0020" },
  mlove: { color: "#E91E63", bg: "#E91E6320" },
  customer: { color: "#00897B", bg: "#00897B20" },
  pickup: { color: "#5C6BC0", bg: "#5C6BC020" },
  antiscam: { color: "#F44336", bg: "#F4433620" },
};

/* ── Dropdown ── */
function Dropdown({ options, value, open, setOpen, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  onChange: (v: string) => void;
}) {
  const label = options.find((o) => o.value === value)?.label || options[0].label;
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 rounded-lg border border-[#27272F] bg-[#18181C] px-3 py-1.5 text-[12px] text-[#EAEAEF] hover:bg-[#1E1E24] transition-colors"
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#8B8B99" strokeWidth="1.5"><path d="M2 4l3 3 3-3" /></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-1 min-w-[140px] rounded-lg border border-[#27272F] bg-[#18181C] py-1 shadow-xl">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#27272F] ${value === o.value ? "text-[#3B82F6]" : "text-[#EAEAEF]"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function ScenePage() {
  const toast = useToast();
  const [phrases, setPhrases] = useState<ScenePhrase[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sceneFilter, setSceneFilter] = useState("");
  const [sceneOpen, setSceneOpen] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState<ScenePhrase | null>(null);
  const [editForm, setEditForm] = useState<Partial<ScenePhrase>>({});

  // New modal
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<Partial<ScenePhrase>>({
    scene: "general", active: true, sortOrder: 0,
  });

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const h = () => { setSceneOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Fetch ── */
  const fetchPhrases = useCallback(async (pg = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sceneFilter) params.set("scene", sceneFilter);
    if (search.trim()) params.set("search", search.trim());
    params.set("page", String(pg));
    params.set("limit", "50");
    try {
      const res = await fetch(`/api/admin/scene-phrases?${params}`);
      const data = await res.json();
      setPhrases(data.phrases || []);
      setPagination(data.pagination || { page: pg, limit: 50, total: 0, totalPages: 0 });
    } catch { /* ignore */ }
    setLoading(false);
  }, [sceneFilter, search]);

  useEffect(() => { fetchPhrases(1); }, [fetchPhrases]);

  /* ── CRUD handlers ── */
  async function handleDelete(id: string) {
    if (!confirm("确定删除这条短语？")) return;
    try {
      const res = await fetch(`/api/admin/scene-phrases?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast("已删除");
      fetchPhrases(pagination.page);
    } catch { toast("删除失败"); }
  }

  async function handleUpdate() {
    if (!editing) return;
    try {
      const res = await fetch("/api/admin/scene-phrases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...editForm }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("已更新");
      setEditing(null);
      fetchPhrases(pagination.page);
    } catch { toast("更新失败"); }
  }

  async function handleCreate() {
    try {
      const res = await fetch("/api/admin/scene-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) throw new Error("Failed");
      toast("已创建");
      setShowNew(false);
      setNewForm({ scene: "general", active: true, sortOrder: 0 });
      fetchPhrases(1);
    } catch { toast("创建失败"); }
  }

  function openEdit(p: ScenePhrase) {
    setEditing(p);
    setEditForm({
      scene: p.scene,
      vi: p.vi,
      zh: p.zh,
      pinyin: p.pinyin,
      culture: p.culture,
      active: p.active,
      sortOrder: p.sortOrder,
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#EAEAEF]">场景短语管理</h1>
        <p className="text-[13px] text-[#55556A] mt-1">管理各场景学习短语</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索越南语或中文..."
          className="h-[34px] w-[240px] rounded-lg border border-[#27272F] bg-[#18181C] px-3 text-[12px] text-[#EAEAEF] placeholder:text-[#55556A] focus:outline-none focus:border-[#3B82F6]"
        />
        <Dropdown options={SCENE_OPTIONS} value={sceneFilter} open={sceneOpen} setOpen={setSceneOpen} onChange={setSceneFilter} />
        <button
          onClick={() => setShowNew(true)}
          className="ml-auto rounded-lg bg-[#3B82F6] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#2563EB] transition-colors"
        >
          + 新增短语
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#27272F] bg-[#111114] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#27272F] bg-[#0C0C0F]">
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">场景</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">越南语</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">中文</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">发音</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">启用</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#55556A]">加载中...</td></tr>
              ) : phrases.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#55556A]">暂无数据</td></tr>
              ) : phrases.map((p) => {
                const sb = SCENE_BADGE[p.scene] || { color: "#8B8B99", bg: "#27272F" };
                return (
                  <tr key={p.id} className="border-b border-[#1E1E24] hover:bg-[#18181C] transition-colors">
                    <td className="px-4 py-3 text-[11px] font-mono text-[#55556A]">{p.id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: sb.color, backgroundColor: sb.bg }}>
                        {SCENE_CN[p.scene] || p.scene}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF] max-w-[240px] truncate">{p.vi}</td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF] max-w-[200px] truncate">{p.zh}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8B8B99] max-w-[160px] truncate">{p.pinyin}</td>
                    <td className="px-4 py-3 text-center text-[12px] text-[#8B8B99]">
                      {p.active ? "✓" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="rounded px-2 py-1 text-[11px] text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/10">编辑</button>
                        <button onClick={() => handleDelete(p.id)} className="rounded px-2 py-1 text-[11px] text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10">删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#27272F] px-4 py-3">
            <span className="text-[11px] text-[#55556A]">共 {pagination.total} 条 · 第 {pagination.page}/{pagination.totalPages} 页</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchPhrases(pagination.page - 1)}
                className="rounded border border-[#27272F] px-3 py-1 text-[11px] text-[#8B8B99] hover:bg-[#1E1E24] disabled:opacity-40"
              >上一页</button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPhrases(pagination.page + 1)}
                className="rounded border border-[#27272F] px-3 py-1 text-[11px] text-[#8B8B99] hover:bg-[#1E1E24] disabled:opacity-40"
              >下一页</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditing(null)}>
          <div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-xl border border-[#27272F] bg-[#18181C] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#EAEAEF]">编辑短语</h2>
              <button onClick={() => setEditing(null)} className="text-[#55556A] hover:text-[#EAEAEF] text-lg">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">场景</label>
                  <select
                    value={editForm.scene || ""}
                    onChange={(e) => setEditForm({ ...editForm, scene: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {SCENE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">排序</label>
                  <input
                    type="number"
                    value={editForm.sortOrder ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">越南语</label>
                <input
                  value={editForm.vi || ""}
                  onChange={(e) => setEditForm({ ...editForm, vi: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">中文</label>
                <input
                  value={editForm.zh || ""}
                  onChange={(e) => setEditForm({ ...editForm, zh: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">发音</label>
                <input
                  value={editForm.pinyin || ""}
                  onChange={(e) => setEditForm({ ...editForm, pinyin: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">文化说明</label>
                <textarea
                  value={editForm.culture || ""}
                  onChange={(e) => setEditForm({ ...editForm, culture: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF] resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.active ?? true}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[12px] text-[#8B8B99]">启用</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-[#27272F] px-4 py-2 text-[12px] text-[#8B8B99] hover:bg-[#27272F]">取消</button>
              <button onClick={handleUpdate} className="rounded-lg bg-[#3B82F6] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#2563EB]">更新</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowNew(false)}>
          <div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-xl border border-[#27272F] bg-[#18181C] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#EAEAEF]">新增短语</h2>
              <button onClick={() => setShowNew(false)} className="text-[#55556A] hover:text-[#EAEAEF] text-lg">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">场景</label>
                  <select
                    value={newForm.scene || "general"}
                    onChange={(e) => setNewForm({ ...newForm, scene: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {SCENE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">排序</label>
                  <input
                    type="number"
                    value={newForm.sortOrder ?? 0}
                    onChange={(e) => setNewForm({ ...newForm, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">越南语</label>
                <input
                  value={newForm.vi || ""}
                  onChange={(e) => setNewForm({ ...newForm, vi: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="例：Xin chào"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">中文</label>
                <input
                  value={newForm.zh || ""}
                  onChange={(e) => setNewForm({ ...newForm, zh: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="例：你好"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">发音</label>
                <input
                  value={newForm.pinyin || ""}
                  onChange={(e) => setNewForm({ ...newForm, pinyin: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="中文近似音"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">文化说明</label>
                <textarea
                  value={newForm.culture || ""}
                  onChange={(e) => setNewForm({ ...newForm, culture: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF] resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newForm.active ?? true}
                  onChange={(e) => setNewForm({ ...newForm, active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[12px] text-[#8B8B99]">启用</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="rounded-lg border border-[#27272F] px-4 py-2 text-[12px] text-[#8B8B99] hover:bg-[#27272F]">取消</button>
              <button onClick={handleCreate} className="rounded-lg bg-[#3B82F6] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#2563EB]">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
