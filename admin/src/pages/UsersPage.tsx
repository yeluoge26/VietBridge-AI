import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Types ── */
interface UserRecord {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  userLevel: number;
  totalCalls: number;
  plan: string;
  usageCount: number;
  banned: boolean;
  createdAt: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  userLevel: string;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number }
interface Funnel { registered: number; firstUse: number; paid: number }

/* ── Constants ── */
const ROLES = [{ value: "user", label: "用户" }, { value: "admin", label: "管理员" }];
const LEVELS = Array.from({ length: 7 }, (_, i) => ({ value: String(i), label: i === 0 ? "Lv0" : `Lv${i}` }));

const planColors: Record<string, { color: string; bg: string }> = {
  FREE: { color: "#8B8B99", bg: "#8B8B9920" },
  PRO: { color: "#3B82F6", bg: "#3B82F620" },
  ENTERPRISE: { color: "#A855F7", bg: "#A855F720" },
  API: { color: "#FBBF24", bg: "#FBBF2420" },
};

const emptyForm: UserForm = { name: "", email: "", password: "", role: "user", userLevel: "1" };
const inputCls = "w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF] focus:border-[#3B82F6] focus:outline-none";
const selectCls = inputCls + " appearance-none";
const labelCls = "block text-[11px] text-[#8B8B99] mb-1";

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [funnel, setFunnel] = useState<Funnel>({ registered: 0, firstUse: 0, paid: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* Modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  /* Delete */
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?page=${page}&limit=${pagination.limit}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
      setFunnel(data.funnel);
    } catch (err) {
      console.error(err);
      toast("加载用户数据失败");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, toast]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  /* ── Filtered ── */
  const filtered = search
    ? users.filter((u) =>
        (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  /* ── Modal ── */
  const openCreate = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (u: UserRecord) => {
    setEditingId(u.id);
    setForm({ name: u.name || "", email: u.email || "", password: "", role: u.role, userLevel: String(u.userLevel ?? 1) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name, email: form.email, role: form.role,
        userLevel: parseInt(form.userLevel) || 1,
      };
      if (editingId) {
        payload.id = editingId;
        if (form.password) payload.password = form.password;
      } else {
        if (!form.password) { toast("新用户需要设置密码"); setSaving(false); return; }
        payload.password = form.password;
      }

      const res = await fetch("/api/admin/users", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "保存失败"); }
      toast(editingId ? "用户已更新" : "用户已创建");
      setModalOpen(false);
      fetchUsers(pagination.page);
    } catch (err) { toast(err instanceof Error ? err.message : "保存失败"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "删除失败"); }
      toast("用户已删除");
      setDeleteId(null);
      fetchUsers(pagination.page);
    } catch (err) { toast(err instanceof Error ? err.message : "删除失败"); }
  };

  /* ── Ban/Unban ── */
  const toggleBan = async (u: UserRecord) => {
    const newBanned = !u.banned;
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, banned: newBanned } : x)));
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, banned: newBanned }),
      });
      if (!res.ok) throw new Error();
      toast(newBanned ? "用户已封禁" : "用户已解封");
    } catch {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, banned: u.banned } : x)));
      toast("操作失败");
    }
  };

  /* ── Pagination ── */
  const goToPage = (p: number) => { if (p >= 1 && p <= pagination.totalPages) fetchUsers(p); };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("zh-CN");

  /* ── Funnel ── */
  const reg = funnel.registered || 1;
  const funnelSteps = [
    { label: "注册", value: funnel.registered, color: "#3B82F6", pct: 100 },
    { label: "活跃", value: funnel.firstUse, color: "#A855F7", pct: Math.round((funnel.firstUse / reg) * 1000) / 10 },
    { label: "付费", value: funnel.paid, color: "#22C55E", pct: Math.round((funnel.paid / reg) * 1000) / 10 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">用户管理</h2>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#55556A]">共 {pagination.total} 位用户</span>
          <button onClick={openCreate} className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
            + 新增用户
          </button>
        </div>
      </div>

      {/* ── Funnel ── */}
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">用户漏斗</h3>
        <div className="space-y-3">
          {funnelSteps.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="text-[11px] text-[#8B8B99] w-10 text-right flex-shrink-0">{s.label}</span>
              <div className="flex-1 relative">
                <div className="h-8 bg-[#111114] rounded-md overflow-hidden">
                  <div className="h-full rounded-md flex items-center px-3 transition-all duration-500" style={{ width: `${Math.max(s.pct, 5)}%`, backgroundColor: `${s.color}25`, borderLeft: `3px solid ${s.color}` }}>
                    <span className="text-[12px] font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#55556A] w-10 flex-shrink-0">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索用户名、邮箱…" className="w-full max-w-xs rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF] focus:border-[#3B82F6] focus:outline-none" />

      {/* ── Table ── */}
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex gap-4"><div className="h-4 bg-[#27272F] rounded w-24" /><div className="h-4 bg-[#27272F] rounded w-32" /><div className="h-4 bg-[#27272F] rounded flex-1" /></div>))}
          </div>
        ) : (
          <>
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-[#2A2A35]">
                  {["用户名", "邮箱", "角色", "等级", "套餐", "调用数", "状态", "注册时间", "操作"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const pc = planColors[u.plan] || planColors.FREE;
                  return (
                    <tr key={u.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                      <td className="px-3 py-3 text-[12px] text-[#EAEAEF] font-medium">{u.name || "—"}</td>
                      <td className="px-3 py-3 text-[12px] text-[#8B8B99]">{u.email || "—"}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${u.role === "admin" ? "text-[#EF4444] bg-[#EF444420]" : "text-[#8B8B99] bg-[#2A2A35]"}`}>
                          {u.role === "admin" ? "管理员" : "用户"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#EAEAEF]">Lv{u.userLevel}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ color: pc.color, backgroundColor: pc.bg }}>{u.plan}</span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#8B8B99]">{u.usageCount}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${u.banned ? "text-[#EF4444] bg-[#EF444420]" : "text-[#22C55E] bg-[#22C55E20]"}`}>
                          {u.banned ? "已封禁" : "正常"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#55556A]">{fmtDate(u.createdAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)} className="px-2 py-1 rounded text-[10px] font-medium text-[#3B82F6] bg-[#3B82F620] hover:bg-[#3B82F630] transition-colors cursor-pointer">编辑</button>
                          <button onClick={() => toggleBan(u)} className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${u.banned ? "text-[#22C55E] bg-[#22C55E20] hover:bg-[#22C55E30]" : "text-[#FBBF24] bg-[#FBBF2420] hover:bg-[#FBBF2430]"}`}>
                            {u.banned ? "解封" : "封禁"}
                          </button>
                          <button onClick={() => setDeleteId(u.id)} className="px-2 py-1 rounded text-[10px] font-medium text-[#EF4444] bg-[#EF444420] hover:bg-[#EF444430] transition-colors cursor-pointer">删除</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-[#55556A]">{search ? "未找到匹配用户" : "暂无用户"}</div>}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A2A35]">
                <span className="text-[10px] text-[#55556A]">第 {pagination.page}/{pagination.totalPages} 页</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1} className="px-2 py-1 text-[11px] rounded-md text-[#8B8B99] hover:bg-[#2A2A35] disabled:opacity-30 cursor-pointer">&laquo;</button>
                  <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-2 py-1 text-[11px] rounded-md text-[#8B8B99] hover:bg-[#2A2A35] disabled:opacity-30 cursor-pointer">&raquo;</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════ Create / Edit Modal ══════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#111114] border border-[#27272F] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-[15px] font-bold text-[#EAEAEF] mb-5">{editingId ? "编辑用户" : "新增用户"}</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>用户名</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="用户名" />
              </div>
              <div>
                <label className={labelCls}>邮箱</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="user@example.com" />
              </div>
              <div>
                <label className={labelCls}>{editingId ? "新密码 (留空不修改)" : "密码"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder={editingId ? "留空则不修改" : "设置密码"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>角色</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={selectCls}>
                    {ROLES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>用户等级</label>
                  <select value={form.userLevel} onChange={(e) => setForm({ ...form, userLevel: e.target.value })} className={selectCls}>
                    {LEVELS.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] border border-[#27272F] hover:bg-[#18181C] transition-colors cursor-pointer">取消</button>
              <button onClick={handleSave} disabled={saving || !form.email.trim()} className="px-4 py-2 rounded-lg text-[12px] font-medium text-white bg-[#3B82F6] hover:bg-[#3B82F6]/90 disabled:opacity-40 transition-all cursor-pointer">
                {saving ? "保存中…" : editingId ? "保存修改" : "创建用户"}
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
            <p className="text-[12px] text-[#8B8B99] mb-5">删除用户将同时删除其所有数据（对话、使用记录等），确定要删除吗？</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] border border-[#27272F] hover:bg-[#18181C] transition-colors cursor-pointer">取消</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 rounded-lg text-[12px] font-medium text-white bg-[#EF4444] hover:bg-[#EF4444]/90 transition-all cursor-pointer">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
