"use client";

import { useState } from "react";

/* ── Types ── */
interface Plan {
  name: string;
  price: string;
  period: string;
  limit: string;
  color: string;
  isCurrent: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  active: boolean;
}

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "已支付" | "待支付" | "失败";
}

/* ── Mock data ── */
const plans: Plan[] = [
  { name: "FREE", price: "¥0", period: "", limit: "50次/天", color: "#8B8B99", isCurrent: false },
  { name: "PRO", price: "¥49", period: "/月", limit: "999次/天", color: "#3B82F6", isCurrent: true },
  { name: "ENTERPRISE", price: "¥299", period: "/月", limit: "无限", color: "#A855F7", isCurrent: false },
  { name: "API", price: "$0.001", period: "/次", limit: "按量付费", color: "#FBBF24", isCurrent: false },
];

const initialKeys: ApiKey[] = [
  { id: "k1", name: "Production Key", key: "vb-pk-****-****-a1b2", createdAt: "2024-10-15", lastUsed: "2024-12-20 14:30", active: true },
  { id: "k2", name: "Staging Key", key: "vb-sk-****-****-c3d4", createdAt: "2024-11-02", lastUsed: "2024-12-19 09:15", active: true },
  { id: "k3", name: "Dev Key", key: "vb-dk-****-****-e5f6", createdAt: "2024-12-01", lastUsed: "2024-12-18 16:45", active: false },
];

const invoices: Invoice[] = [
  { id: "inv1", date: "2024-12-01", description: "PRO 月度订阅 - 12月", amount: "¥49.00", status: "已支付" },
  { id: "inv2", date: "2024-12-15", description: "API 超量调用 (2,340次)", amount: "¥16.38", status: "已支付" },
  { id: "inv3", date: "2024-11-01", description: "PRO 月度订阅 - 11月", amount: "¥49.00", status: "已支付" },
  { id: "inv4", date: "2025-01-01", description: "PRO 月度订阅 - 1月", amount: "¥49.00", status: "待支付" },
  { id: "inv5", date: "2024-10-15", description: "ENTERPRISE 升级差价", amount: "¥125.00", status: "失败" },
];

const invoiceStatusColors: Record<string, { color: string; bg: string }> = {
  已支付: { color: "#22C55E", bg: "#22C55E20" },
  待支付: { color: "#FBBF24", bg: "#FBBF2420" },
  失败: { color: "#EF4444", bg: "#EF444420" },
};

export default function BillPage() {
  const [keys, setKeys] = useState(initialKeys);

  const toggleKey = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">计费管理</h2>
      </div>

      {/* ── 套餐方案 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">套餐方案</h3>
        <div className="grid grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-[#18181C] rounded-xl p-4 transition-all hover:border-[#333340] ${
                plan.isCurrent
                  ? "ring-1 ring-[#3B82F6]/30"
                  : ""
              }`}
              style={{
                border: plan.isCurrent
                  ? `1px solid ${plan.color}40`
                  : "1px solid #2A2A35",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-bold" style={{ color: plan.color }}>
                  {plan.name}
                </span>
                {plan.isCurrent && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium text-[#3B82F6] bg-[#3B82F620]">
                    当前
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className="text-[24px] font-bold text-[#EAEAEF]">{plan.price}</span>
                {plan.period && (
                  <span className="text-[12px] text-[#55556A]">{plan.period}</span>
                )}
              </div>
              <div className="text-[11px] text-[#8B8B99]">{plan.limit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── API 密钥 ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF]">API 密钥</h3>
          <button className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
            生成新密钥
          </button>
        </div>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#2A2A35]">
                {["名称", "密钥", "创建时间", "最后使用", "状态"].map((h) => (
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
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                  <td className="px-4 py-3 text-[12px] font-medium text-[#EAEAEF]">{k.name}</td>
                  <td className="px-4 py-3 text-[11px] text-[#55556A] font-mono">{k.key}</td>
                  <td className="px-4 py-3 text-[11px] text-[#8B8B99]">{k.createdAt}</td>
                  <td className="px-4 py-3 text-[11px] text-[#8B8B99]">{k.lastUsed}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleKey(k.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                        k.active ? "bg-[#3B82F6]" : "bg-[#2A2A35]"
                      }`}
                      role="switch"
                      aria-checked={k.active}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          k.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 账单历史 ── */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-3">账单历史</h3>
        <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#2A2A35]">
                {["日期", "描述", "金额", "状态"].map((h) => (
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
              {invoices.map((inv) => {
                const sc = invoiceStatusColors[inv.status] || { color: "#8B8B99", bg: "#2A2A35" };
                return (
                  <tr key={inv.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                    <td className="px-4 py-3 text-[11px] text-[#8B8B99]">{inv.date}</td>
                    <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{inv.description}</td>
                    <td className="px-4 py-3 text-[12px] font-medium text-[#FBBF24]">{inv.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ color: sc.color, backgroundColor: sc.bg }}
                      >
                        {inv.status}
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
