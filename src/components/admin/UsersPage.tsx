"use client";

import { useState } from "react";

/* ── Types ── */
interface User {
  id: string;
  name: string;
  email: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  totalUsage: number;
  monthlyLTV: string;
  favoriteScene: string;
  registeredAt: string;
  recentConversations: number;
  favoriteScenes: string[];
}

/* ── Mock data ── */
const funnelSteps = [
  { label: "注册", value: 1000, color: "#3B82F6", pct: 100 },
  { label: "首次使用", value: 720, color: "#A855F7", pct: 72 },
  { label: "7日留存", value: 340, color: "#FBBF24", pct: 34 },
  { label: "付费转化", value: 85, color: "#22C55E", pct: 8.5 },
];

const users: User[] = [
  {
    id: "u1",
    name: "Nguyen Van Minh",
    email: "minh@example.com",
    plan: "PRO",
    totalUsage: 1247,
    monthlyLTV: "$49",
    favoriteScene: "翻译",
    registeredAt: "2024-09-15",
    recentConversations: 34,
    favoriteScenes: ["翻译", "回复", "风险"],
  },
  {
    id: "u2",
    name: "Tran Thi Hoa",
    email: "hoa@example.com",
    plan: "ENTERPRISE",
    totalUsage: 3892,
    monthlyLTV: "$299",
    favoriteScene: "风险",
    registeredAt: "2024-07-22",
    recentConversations: 89,
    favoriteScenes: ["风险", "合同", "翻译", "扫描"],
  },
  {
    id: "u3",
    name: "Le Van Duc",
    email: "duc@example.com",
    plan: "FREE",
    totalUsage: 56,
    monthlyLTV: "$0",
    favoriteScene: "教学",
    registeredAt: "2024-12-01",
    recentConversations: 5,
    favoriteScenes: ["教学"],
  },
  {
    id: "u4",
    name: "Pham Thi Lan",
    email: "lan@example.com",
    plan: "PRO",
    totalUsage: 782,
    monthlyLTV: "$49",
    favoriteScene: "回复",
    registeredAt: "2024-10-08",
    recentConversations: 22,
    favoriteScenes: ["回复", "翻译"],
  },
  {
    id: "u5",
    name: "Hoang Van Tung",
    email: "tung@example.com",
    plan: "FREE",
    totalUsage: 128,
    monthlyLTV: "$0",
    favoriteScene: "翻译",
    registeredAt: "2024-11-20",
    recentConversations: 12,
    favoriteScenes: ["翻译", "教学"],
  },
];

const planColors: Record<string, { color: string; bg: string }> = {
  FREE: { color: "#8B8B99", bg: "#8B8B9920" },
  PRO: { color: "#3B82F6", bg: "#3B82F620" },
  ENTERPRISE: { color: "#A855F7", bg: "#A855F720" },
};

interface UsersPageProps {
  toast: (msg: string) => void;
}

export default function UsersPage({ toast }: UsersPageProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">用户分析</h2>
      </div>

      {/* ── 漏斗可视化 ── */}
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">漏斗可视化</h3>
        <div className="space-y-3">
          {funnelSteps.map((step) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="text-[11px] text-[#8B8B99] w-16 text-right flex-shrink-0">{step.label}</span>
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
                    <span className="text-[12px] font-bold" style={{ color: step.color }}>
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#55556A] w-10 flex-shrink-0">{step.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 用户列表 + Detail panel ── */}
      <div className="flex gap-4">
        <div className={`${selectedUser ? "w-[60%]" : "w-full"} transition-all`}>
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-[#2A2A35]">
                  {["用户", "邮箱", "计划", "总使用次数", "月LTV", "常用场景", "注册时间"].map((h) => (
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
                {users.map((u) => {
                  const pc = planColors[u.plan] || { color: "#8B8B99", bg: "#2A2A35" };
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                      className={`border-b border-[#2A2A35] hover:bg-[#1E1E24] cursor-pointer transition-colors ${
                        selectedUser?.id === u.id ? "bg-[#1E1E24]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-[12px] font-medium text-[#EAEAEF]">{u.name}</td>
                      <td className="px-4 py-3 text-[11px] text-[#8B8B99]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ color: pc.color, backgroundColor: pc.bg }}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{u.totalUsage.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[12px] font-medium text-[#22C55E]">{u.monthlyLTV}</td>
                      <td className="px-4 py-3 text-[11px] text-[#8B8B99]">{u.favoriteScene}</td>
                      <td className="px-4 py-3 text-[11px] text-[#55556A]">{u.registeredAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedUser && (
          <div className="w-[40%] bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#EAEAEF]">{selectedUser.name}</div>
                <div className="text-[11px] text-[#55556A] mt-0.5">{selectedUser.email}</div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#55556A] hover:text-[#EAEAEF] cursor-pointer text-sm"
              >
                x
              </button>
            </div>

            {/* Usage chart placeholder */}
            <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
              <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">使用趋势</div>
              <div className="h-20 flex items-end gap-1">
                {[35, 42, 28, 55, 67, 48, 72, 60, 45, 80, 53, 65].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${val}%`,
                      backgroundColor: "#3B82F640",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-3 text-center">
                <div className="text-[9px] text-[#55556A] mb-0.5">近期对话</div>
                <div className="text-[16px] font-bold text-[#3B82F6]">{selectedUser.recentConversations}</div>
              </div>
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-3 text-center">
                <div className="text-[9px] text-[#55556A] mb-0.5">月LTV</div>
                <div className="text-[16px] font-bold text-[#22C55E]">{selectedUser.monthlyLTV}</div>
              </div>
            </div>

            {/* Favorite scenes */}
            <div>
              <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">常用场景</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.favoriteScenes.map((scene) => (
                  <span
                    key={scene}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium text-[#EAEAEF] bg-[#111114] border border-[#2A2A35]"
                  >
                    {scene}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
