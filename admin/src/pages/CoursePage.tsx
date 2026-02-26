import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Types ── */
interface Course {
  id: string;
  category: string;
  chinese: string;
  vietnamese: string;
  pronunciation: string;
  culturalNote: string;
  exampleSentence: string;
  difficulty: string;
  isDaily: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ── Scene / difficulty mappings ── */
const SCENE_OPTIONS = [
  { value: "", label: "全部分类" },
  { value: "general", label: "通用" },
  { value: "business", label: "商务" },
  { value: "staff", label: "员工" },
  { value: "couple", label: "情侣" },
  { value: "rent", label: "租房" },
  { value: "restaurant", label: "餐厅" },
  { value: "hospital", label: "医院" },
  { value: "housekeeping", label: "家政" },
];

const SCENE_CN: Record<string, string> = {
  general: "通用", business: "商务", staff: "员工", couple: "情侣",
  rent: "租房", restaurant: "餐厅", hospital: "医院", housekeeping: "家政",
};

const DIFFICULTY_OPTIONS = [
  { value: "", label: "全部难度" },
  { value: "beginner", label: "初级" },
  { value: "intermediate", label: "中级" },
  { value: "advanced", label: "高级" },
];

const DIFF_STYLE: Record<string, { color: string; bg: string }> = {
  beginner: { color: "#22C55E", bg: "#22C55E18" },
  intermediate: { color: "#3B82F6", bg: "#3B82F618" },
  advanced: { color: "#F97316", bg: "#F9731618" },
};

const DIFF_CN: Record<string, string> = {
  beginner: "初级", intermediate: "中级", advanced: "高级",
};

const SCENE_BADGE: Record<string, { color: string; bg: string }> = {
  general: { color: "#607D8B", bg: "#607D8B20" },
  business: { color: "#1565C0", bg: "#1565C020" },
  staff: { color: "#2E7D32", bg: "#2E7D3220" },
  couple: { color: "#C62828", bg: "#C6282820" },
  rent: { color: "#4527A0", bg: "#4527A020" },
  restaurant: { color: "#E65100", bg: "#E6510020" },
  hospital: { color: "#00838F", bg: "#00838F20" },
  housekeeping: { color: "#795548", bg: "#79554820" },
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
export default function CoursePage() {
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState<Partial<Course>>({});

  // New modal
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Course>>({
    category: "general", difficulty: "beginner", isDaily: false,
  });

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const h = () => { setCatOpen(false); setDiffOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Fetch ── */
  const fetchCourses = useCallback(async (pg = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (catFilter) params.set("category", catFilter);
    if (diffFilter) params.set("difficulty", diffFilter);
    if (search.trim()) params.set("search", search.trim());
    params.set("page", String(pg));
    params.set("limit", "50");
    try {
      const res = await fetch(`/api/admin/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setPagination(data.pagination || { page: pg, limit: 50, total: 0, totalPages: 0 });
    } catch { /* ignore */ }
    setLoading(false);
  }, [catFilter, diffFilter, search]);

  useEffect(() => { fetchCourses(1); }, [fetchCourses]);

  /* ── CRUD handlers ── */
  async function handleDelete(id: string) {
    if (!confirm("确定删除这条课程？")) return;
    try {
      const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast("已删除");
      fetchCourses(pagination.page);
    } catch { toast("删除失败"); }
  }

  async function handleUpdate() {
    if (!editing) return;
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...editForm }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("已更新");
      setEditing(null);
      fetchCourses(pagination.page);
    } catch { toast("更新失败"); }
  }

  async function handleCreate() {
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) throw new Error("Failed");
      toast("已创建");
      setShowNew(false);
      setNewForm({ category: "general", difficulty: "beginner", isDaily: false });
      fetchCourses(1);
    } catch { toast("创建失败"); }
  }

  function openEdit(c: Course) {
    setEditing(c);
    setEditForm({
      category: c.category,
      chinese: c.chinese,
      vietnamese: c.vietnamese,
      pronunciation: c.pronunciation,
      culturalNote: c.culturalNote,
      exampleSentence: c.exampleSentence,
      difficulty: c.difficulty,
      isDaily: c.isDaily,
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#EAEAEF]">课程管理</h1>
        <p className="text-[13px] text-[#55556A] mt-1">管理越语学习内容</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索中文或越南语..."
          className="h-[34px] w-[240px] rounded-lg border border-[#27272F] bg-[#18181C] px-3 text-[12px] text-[#EAEAEF] placeholder:text-[#55556A] focus:outline-none focus:border-[#3B82F6]"
        />
        <Dropdown options={SCENE_OPTIONS} value={catFilter} open={catOpen} setOpen={setCatOpen} onChange={setCatFilter} />
        <Dropdown options={DIFFICULTY_OPTIONS} value={diffFilter} open={diffOpen} setOpen={setDiffOpen} onChange={setDiffFilter} />
        <button
          onClick={() => setShowNew(true)}
          className="ml-auto rounded-lg bg-[#3B82F6] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#2563EB] transition-colors"
        >
          + 新增课程
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#27272F] bg-[#111114] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#27272F] bg-[#0C0C0F]">
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">分类</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">中文</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">越南语</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">发音</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">难度</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">每日</th>
                <th className="px-4 py-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[#55556A]">加载中...</td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[#55556A]">暂无数据</td></tr>
              ) : courses.map((c) => {
                const ds = DIFF_STYLE[c.difficulty] || { color: "#8B8B99", bg: "#27272F" };
                const sb = SCENE_BADGE[c.category] || { color: "#8B8B99", bg: "#27272F" };
                return (
                  <tr key={c.id} className="border-b border-[#1E1E24] hover:bg-[#18181C] transition-colors">
                    <td className="px-4 py-3 text-[11px] font-mono text-[#55556A]">{c.id.slice(-6)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: sb.color, backgroundColor: sb.bg }}>
                        {SCENE_CN[c.category] || c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF] max-w-[200px] truncate">{c.chinese}</td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF] max-w-[240px] truncate">{c.vietnamese}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8B8B99] max-w-[160px] truncate">{c.pronunciation}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: ds.color, backgroundColor: ds.bg }}>
                        {DIFF_CN[c.difficulty] || c.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[12px] text-[#8B8B99]">
                      {c.isDaily ? "✓" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="rounded px-2 py-1 text-[11px] text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/10">编辑</button>
                        <button onClick={() => handleDelete(c.id)} className="rounded px-2 py-1 text-[11px] text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10">删除</button>
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
                onClick={() => fetchCourses(pagination.page - 1)}
                className="rounded border border-[#27272F] px-3 py-1 text-[11px] text-[#8B8B99] hover:bg-[#1E1E24] disabled:opacity-40"
              >上一页</button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchCourses(pagination.page + 1)}
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
              <h2 className="text-[16px] font-bold text-[#EAEAEF]">编辑课程</h2>
              <button onClick={() => setEditing(null)} className="text-[#55556A] hover:text-[#EAEAEF] text-lg">×</button>
            </div>

            <div className="space-y-4">
              {/* Row: category + difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">分类</label>
                  <select
                    value={editForm.category || ""}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {SCENE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">难度</label>
                  <select
                    value={editForm.difficulty || ""}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {DIFFICULTY_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">中文</label>
                <input
                  value={editForm.chinese || ""}
                  onChange={(e) => setEditForm({ ...editForm, chinese: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">越南语</label>
                <input
                  value={editForm.vietnamese || ""}
                  onChange={(e) => setEditForm({ ...editForm, vietnamese: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">发音</label>
                <input
                  value={editForm.pronunciation || ""}
                  onChange={(e) => setEditForm({ ...editForm, pronunciation: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">文化说明</label>
                <textarea
                  value={editForm.culturalNote || ""}
                  onChange={(e) => setEditForm({ ...editForm, culturalNote: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">例句</label>
                <input
                  value={editForm.exampleSentence || ""}
                  onChange={(e) => setEditForm({ ...editForm, exampleSentence: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.isDaily || false}
                  onChange={(e) => setEditForm({ ...editForm, isDaily: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[12px] text-[#8B8B99]">设为每日一句</span>
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
              <h2 className="text-[16px] font-bold text-[#EAEAEF]">新增课程</h2>
              <button onClick={() => setShowNew(false)} className="text-[#55556A] hover:text-[#EAEAEF] text-lg">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">分类</label>
                  <select
                    value={newForm.category || "general"}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {SCENE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">难度</label>
                  <select
                    value={newForm.difficulty || "beginner"}
                    onChange={(e) => setNewForm({ ...newForm, difficulty: e.target.value })}
                    className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  >
                    {DIFFICULTY_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">中文</label>
                <input
                  value={newForm.chinese || ""}
                  onChange={(e) => setNewForm({ ...newForm, chinese: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="例：你好"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">越南语</label>
                <input
                  value={newForm.vietnamese || ""}
                  onChange={(e) => setNewForm({ ...newForm, vietnamese: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="例：Xin chào"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">发音</label>
                <input
                  value={newForm.pronunciation || ""}
                  onChange={(e) => setNewForm({ ...newForm, pronunciation: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                  placeholder="中文近似音"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">文化说明</label>
                <textarea
                  value={newForm.culturalNote || ""}
                  onChange={(e) => setNewForm({ ...newForm, culturalNote: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B8B99] mb-1">例句</label>
                <input
                  value={newForm.exampleSentence || ""}
                  onChange={(e) => setNewForm({ ...newForm, exampleSentence: e.target.value })}
                  className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newForm.isDaily || false}
                  onChange={(e) => setNewForm({ ...newForm, isDaily: e.target.checked })}
                  className="rounded"
                />
                <span className="text-[12px] text-[#8B8B99]">设为每日一句</span>
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
