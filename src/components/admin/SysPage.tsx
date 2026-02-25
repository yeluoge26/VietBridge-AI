"use client";

import { useState } from "react";

/* ── Types ── */
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

interface ServiceStatus {
  id: string;
  name: string;
  type: string;
  online: boolean;
  latency: string;
  uptime: string;
}

interface AuditEntry {
  id: string;
  time: string;
  operator: string;
  action: string;
  target: string;
  result: "成功" | "失败" | "警告";
}

/* ── Mock data ── */
const permissionKeys = ["查看", "编辑", "删除", "发布", "管理用户", "系统设置"];

const roles: Role[] = [
  {
    id: "r1",
    name: "超级管理员",
    description: "拥有所有权限",
    permissions: { "查看": true, "编辑": true, "删除": true, "发布": true, "管理用户": true, "系统设置": true },
  },
  {
    id: "r2",
    name: "管理员",
    description: "管理内容和用户",
    permissions: { "查看": true, "编辑": true, "删除": true, "发布": true, "管理用户": true, "系统设置": false },
  },
  {
    id: "r3",
    name: "运营",
    description: "管理内容发布",
    permissions: { "查看": true, "编辑": true, "删除": false, "发布": true, "管理用户": false, "系统设置": false },
  },
  {
    id: "r4",
    name: "只读",
    description: "仅查看权限",
    permissions: { "查看": true, "编辑": false, "删除": false, "发布": false, "管理用户": false, "系统设置": false },
  },
];

const services: ServiceStatus[] = [
  { id: "s1", name: "Database", type: "PostgreSQL", online: true, latency: "3ms", uptime: "99.99%" },
  { id: "s2", name: "Cache", type: "Redis", online: true, latency: "1ms", uptime: "99.98%" },
  { id: "s3", name: "LLM Primary", type: "OpenAI", online: true, latency: "420ms", uptime: "99.90%" },
  { id: "s4", name: "LLM Secondary", type: "Qwen", online: true, latency: "280ms", uptime: "99.95%" },
  { id: "s5", name: "Payment", type: "Stripe", online: true, latency: "150ms", uptime: "99.97%" },
  { id: "s6", name: "Storage", type: "Vercel", online: false, latency: "---", uptime: "98.50%" },
];

const auditLog: AuditEntry[] = [
  { id: "a1", time: "2024-12-20 14:32", operator: "张工", action: "更新 Prompt", target: "System Persona v1.4", result: "成功" },
  { id: "a2", time: "2024-12-20 13:15", operator: "李工", action: "新增规则", target: "风控规则 #12", result: "成功" },
  { id: "a3", time: "2024-12-20 11:48", operator: "王工", action: "删除 API Key", target: "vb-dk-****-e5f6", result: "警告" },
  { id: "a4", time: "2024-12-20 10:22", operator: "系统", action: "自动备份", target: "PostgreSQL 全量备份", result: "成功" },
  { id: "a5", time: "2024-12-20 09:05", operator: "张工", action: "修改路由", target: "翻译x合同 路由规则", result: "失败" },
];

const resultColors: Record<string, { color: string; bg: string }> = {
  "成功": { color: "#22C55E", bg: "#22C55E20" },
  "失败": { color: "#EF4444", bg: "#EF444420" },
  "警告": { color: "#FBBF24", bg: "#FBBF2420" },
};

export default function SysPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>("r1");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">系统设置</h2>
      </div>

      {/* ── RBAC 角色 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">RBAC 角色</h3>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#2A2A35]">
                <th className="px-4 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider">角色</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider">描述</th>
                {permissionKeys.map((p) => (
                  <th key={p} className="px-3 py-3 text-center text-[10px] font-medium text-[#55556A] uppercase tracking-wider">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.id}
                  onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                  className="border-b border-[#2A2A35] hover:bg-[#1E1E24] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-[12px] font-semibold text-[#EAEAEF]">{role.name}</td>
                  <td className="px-4 py-3 text-[11px] text-[#8B8B99]">{role.description}</td>
                  {permissionKeys.map((p) => (
                    <td key={p} className="px-3 py-3 text-center">
                      {role.permissions[p] ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#22C55E20]">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EF444420]">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M3 3l4 4M7 3l-4 4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 环境状态 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">环境状态</h3>
        <div className="grid grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 hover:border-[#333340] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
                    <span
                      className="absolute inset-0 rounded-full opacity-30 animate-ping"
                      style={{ backgroundColor: svc.online ? "#22C55E" : "#EF4444" }}
                    />
                    <span
                      className="relative w-2 h-2 rounded-full"
                      style={{ backgroundColor: svc.online ? "#22C55E" : "#EF4444" }}
                    />
                  </span>
                  <span className="text-[12px] font-semibold text-[#EAEAEF]">{svc.name}</span>
                </div>
                <span className="text-[10px] text-[#55556A]">{svc.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] text-[#55556A] uppercase tracking-wider mb-0.5">延迟</div>
                  <div className="text-[13px] font-bold text-[#EAEAEF]">{svc.latency}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#55556A] uppercase tracking-wider mb-0.5">Uptime</div>
                  <div className={`text-[13px] font-bold ${
                    parseFloat(svc.uptime) >= 99.9 ? "text-[#22C55E]" : "text-[#FBBF24]"
                  }`}>
                    {svc.uptime}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 审计日志 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">审计日志</h3>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#2A2A35]">
                {["时间", "操作者", "操作", "目标", "结果"].map((h) => (
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
              {auditLog.map((entry) => {
                const rc = resultColors[entry.result] || { color: "#8B8B99", bg: "#2A2A35" };
                return (
                  <tr key={entry.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                    <td className="px-4 py-3 text-[11px] text-[#55556A] font-mono">{entry.time}</td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{entry.operator}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{entry.action}</td>
                    <td className="px-4 py-3 text-[11px] text-[#8B8B99] font-mono">{entry.target}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ color: rc.color, backgroundColor: rc.bg }}
                      >
                        {entry.result}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
