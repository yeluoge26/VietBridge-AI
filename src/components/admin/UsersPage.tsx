"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface UserSubscription {
  plan: "FREE" | "PRO" | "ENTERPRISE" | "API";
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  subscription: UserSubscription | null;
  usageCount: number;
  userLevel: number;
  totalCalls: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Funnel {
  registered: number;
  firstUse: number;
  paid: number;
}

interface LevelCount {
  level: number;
  count: number;
}

interface ApiResponse {
  users: User[];
  pagination: Pagination;
  funnel: Funnel;
  levelDistribution?: LevelCount[];
}

/* ── Level badge styles ── */
const LEVEL_STYLES: Record<number, { color: string; bg: string }> = {
  1: { color: "#8B8B99", bg: "#8B8B9920" },
  2: { color: "#22C55E", bg: "#22C55E20" },
  3: { color: "#3B82F6", bg: "#3B82F620" },
  4: { color: "#A855F7", bg: "#A855F720" },
  5: { color: "#F97316", bg: "#F9731620" },
  6: { color: "#EF4444", bg: "#EF444420" },
};

/* ── Plan colors ── */
const planColors: Record<string, { color: string; bg: string }> = {
  FREE: { color: "#8B8B99", bg: "#8B8B9920" },
  PRO: { color: "#3B82F6", bg: "#3B82F620" },
  ENTERPRISE: { color: "#A855F7", bg: "#A855F720" },
  API: { color: "#FBBF24", bg: "#FBBF2420" },
};

interface UsersPageProps {
  toast: (msg: string) => void;
}

export default function UsersPage({ toast }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [funnel, setFunnel] = useState<Funnel>({
    registered: 0,
    firstUse: 0,
    paid: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelDistribution, setLevelDistribution] = useState<LevelCount[]>([]);

  const fetchUsers = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/users?page=${page}&limit=${pagination.limit}`
        );
        if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
        const data: ApiResponse = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
        setFunnel(data.funnel);
        setLevelDistribution(data.levelDistribution || []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown error loading users";
        toast(message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, toast]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  /* ── Funnel steps derived from real data ── */
  const registered = funnel.registered || 1; // avoid division by zero
  const funnelSteps = [
    {
      label: "注册",
      value: funnel.registered,
      color: "#3B82F6",
      pct: 100,
    },
    {
      label: "首次使用",
      value: funnel.firstUse,
      color: "#A855F7",
      pct: Math.round((funnel.firstUse / registered) * 1000) / 10,
    },
    {
      label: "付费转化",
      value: funnel.paid,
      color: "#22C55E",
      pct: Math.round((funnel.paid / registered) * 1000) / 10,
    },
  ];

  /* ── Helpers ── */
  const getPlan = (u: User): string =>
    u.subscription?.plan ?? "FREE";

  const getPlanStyle = (u: User) => {
    const plan = getPlan(u);
    return planColors[plan] || planColors.FREE;
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setSelectedUser(null);
    fetchUsers(page);
  };

  /* ── Build page number buttons ── */
  const buildPageNumbers = (): (number | "ellipsis")[] => {
    const { page, totalPages } = pagination;
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (page > 3) pages.push("ellipsis");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">用户分析</h2>
        <span className="text-[11px] text-[#55556A]">
          共 {pagination.total.toLocaleString()} 位用户
        </span>
      </div>

      {/* ── 用户级别分布 ── */}
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">用户级别分布</h3>
        <div className="grid grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((level) => {
            const ls = LEVEL_STYLES[level] || { color: "#8B8B99", bg: "#8B8B9920" };
            const item = levelDistribution.find((d) => d.level === level);
            const count = item?.count || 0;
            return (
              <div
                key={level}
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: ls.bg, border: `1px solid ${ls.color}30` }}
              >
                <div className="text-[12px] font-bold" style={{ color: ls.color }}>
                  L{level}
                </div>
                <div className="text-[18px] font-bold text-[#EAEAEF] mt-1">
                  {count.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 漏斗可视化 ── */}
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">
          漏斗可视化
        </h3>
        <div className="space-y-3">
          {funnelSteps.map((step) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="text-[11px] text-[#8B8B99] w-16 text-right flex-shrink-0">
                {step.label}
              </span>
              <div className="flex-1 relative">
                <div className="h-8 bg-[#111114] rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md flex items-center px-3 transition-all duration-500"
                    style={{
                      width: `${step.pct}%`,
                      backgroundColor: `${step.color}25`,
                      borderLeft: `3px solid ${step.color}`,
                      minWidth: "60px",
                    }}
                  >
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: step.color }}
                    >
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#55556A] w-10 flex-shrink-0">
                {step.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 用户列表 + Detail panel ── */}
      <div className="flex gap-4">
        <div
          className={`${selectedUser ? "w-[60%]" : "w-full"} transition-all`}
        >
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="text-[12px] text-[#55556A]">加载中...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <span className="text-[12px] text-[#55556A]">暂无用户数据</span>
              </div>
            ) : (
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="border-b border-[#2A2A35]">
                    {["用户", "邮箱", "计划", "级别", "使用次数", "角色"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const pc = getPlanStyle(u);
                    const plan = getPlan(u);
                    return (
                      <tr
                        key={u.id}
                        onClick={() =>
                          setSelectedUser(
                            selectedUser?.id === u.id ? null : u
                          )
                        }
                        className={`border-b border-[#2A2A35] hover:bg-[#1E1E24] cursor-pointer transition-colors ${
                          selectedUser?.id === u.id ? "bg-[#1E1E24]" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-[12px] font-medium text-[#EAEAEF]">
                          {u.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#8B8B99]">
                          {u.email || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              color: pc.color,
                              backgroundColor: pc.bg,
                            }}
                          >
                            {plan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const lvl = u.userLevel || 1;
                            const ls = LEVEL_STYLES[lvl] || LEVEL_STYLES[1];
                            return (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{ color: ls.color, backgroundColor: ls.bg }}
                              >
                                L{lvl}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">
                          {u.usageCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#55556A]">
                          {u.role}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* ── Pagination controls ── */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A2A35]">
                <span className="text-[10px] text-[#55556A]">
                  第 {pagination.page} / {pagination.totalPages} 页
                </span>

                <div className="flex items-center gap-1">
                  {/* Previous */}
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-2 py-1 text-[11px] rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#8B8B99] hover:bg-[#2A2A35] hover:text-[#EAEAEF] cursor-pointer"
                  >
                    &laquo;
                  </button>

                  {/* Page numbers */}
                  {buildPageNumbers().map((p, idx) =>
                    p === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-[11px] text-[#55556A]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-2.5 py-1 text-[11px] rounded-md transition-colors cursor-pointer ${
                          p === pagination.page
                            ? "bg-[#3B82F6] text-white font-semibold"
                            : "text-[#8B8B99] hover:bg-[#2A2A35] hover:text-[#EAEAEF]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-2 py-1 text-[11px] rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#8B8B99] hover:bg-[#2A2A35] hover:text-[#EAEAEF] cursor-pointer"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedUser && (
          <div className="w-[40%] bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#EAEAEF]">
                  {selectedUser.name || "未命名用户"}
                </div>
                <div className="text-[11px] text-[#55556A] mt-0.5">
                  {selectedUser.email || "无邮箱"}
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#55556A] hover:text-[#EAEAEF] cursor-pointer text-sm"
              >
                x
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-3 text-center">
                <div className="text-[9px] text-[#55556A] mb-0.5">计划</div>
                <div
                  className="text-[14px] font-bold"
                  style={{
                    color: getPlanStyle(selectedUser).color,
                  }}
                >
                  {getPlan(selectedUser)}
                </div>
              </div>
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-3 text-center">
                <div className="text-[9px] text-[#55556A] mb-0.5">使用次数</div>
                <div className="text-[16px] font-bold text-[#3B82F6]">
                  {selectedUser.usageCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">
                角色
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium text-[#EAEAEF] bg-[#111114] border border-[#2A2A35]">
                {selectedUser.role}
              </span>
            </div>

            {/* User ID */}
            <div>
              <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">
                用户 ID
              </div>
              <div className="text-[10px] text-[#8B8B99] font-mono bg-[#111114] border border-[#2A2A35] rounded-md px-3 py-2 break-all">
                {selectedUser.id}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
