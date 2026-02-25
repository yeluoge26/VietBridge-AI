"use client";

import { useState } from "react";
import StatusDot from "./StatusDot";
import Badge from "./Badge";

/* ── Types ── */
interface LogEntry {
  id: string;
  status: "ok" | "warn" | "alert";
  time: string;
  user: string;
  task: string;
  taskColor: string;
  taskBg: string;
  model: string;
  tokens: number;
  cost: string;
  latency: string;
  risk: number;
  ragHit: boolean;
  scene: string;
  input: string;
  output: string;
}

/* ── Mock data ── */
const logs: LogEntry[] = [
  {
    id: "LOG-001",
    status: "ok",
    time: "14:32:05",
    user: "user_01",
    task: "翻译",
    taskColor: "#3B82F6",
    taskBg: "#3B82F6/15",
    model: "Qwen-14B",
    tokens: 1240,
    cost: "$0.002",
    latency: "320ms",
    risk: 12,
    ragHit: true,
    scene: "电商客服",
    input: "帮我翻译这段越南语：Xin chao, toi muon dat hang...",
    output: "你好，我想下单购买这个产品...",
  },
  {
    id: "LOG-002",
    status: "ok",
    time: "14:31:42",
    user: "user_05",
    task: "回复",
    taskColor: "#A855F7",
    taskBg: "#A855F7/15",
    model: "GPT-4o",
    tokens: 2100,
    cost: "$0.008",
    latency: "890ms",
    risk: 8,
    ragHit: true,
    scene: "售后支持",
    input: "客户投诉产品质量问题，请帮我草拟回复",
    output: "尊敬的客户，感谢您的反馈。我们非常重视产品质量...",
  },
  {
    id: "LOG-003",
    status: "warn",
    time: "14:30:18",
    user: "user_12",
    task: "风险",
    taskColor: "#EF4444",
    taskBg: "#EF4444/15",
    model: "Qwen-14B",
    tokens: 890,
    cost: "$0.001",
    latency: "280ms",
    risk: 65,
    ragHit: false,
    scene: "风险检测",
    input: "检查这个供应商的信用评级和历史记录",
    output: "[风险评估] 该供应商存在多次延迟交货记录...",
  },
  {
    id: "LOG-004",
    status: "alert",
    time: "14:29:55",
    user: "user_08",
    task: "翻译",
    taskColor: "#3B82F6",
    taskBg: "#3B82F6/15",
    model: "GPT-4o",
    tokens: 3400,
    cost: "$0.015",
    latency: "2100ms",
    risk: 92,
    ragHit: false,
    scene: "合同翻译",
    input: "翻译这份越南语法律合同的关键条款",
    output: "[超时重试] 合同第三条：违约责任...",
  },
  {
    id: "LOG-005",
    status: "ok",
    time: "14:28:30",
    user: "user_03",
    task: "教学",
    taskColor: "#22C55E",
    taskBg: "#22C55E/15",
    model: "Qwen-7B",
    tokens: 560,
    cost: "$0.001",
    latency: "150ms",
    risk: 5,
    ragHit: true,
    scene: "语言教学",
    input: "教我越南语的基本问候语",
    output: "越南语基本问候语：Xin chao (你好)...",
  },
  {
    id: "LOG-006",
    status: "warn",
    time: "14:27:12",
    user: "user_15",
    task: "扫描",
    taskColor: "#F59E0B",
    taskBg: "#F59E0B/15",
    model: "Claude-3.5",
    tokens: 1800,
    cost: "$0.006",
    latency: "1200ms",
    risk: 55,
    ragHit: false,
    scene: "发票扫描",
    input: "[OCR Image] 扫描越南语发票内容",
    output: "发票编号: VN-2024-0892, 金额: 15,000,000 VND...",
  },
  {
    id: "LOG-007",
    status: "ok",
    time: "14:25:48",
    user: "user_22",
    task: "回复",
    taskColor: "#A855F7",
    taskBg: "#A855F7/15",
    model: "Qwen-14B",
    tokens: 980,
    cost: "$0.002",
    latency: "340ms",
    risk: 10,
    ragHit: true,
    scene: "询价回复",
    input: "帮我用越南语回复这个询价邮件",
    output: "Kinh gui Quy khach, Cam on quy khach da lien he...",
  },
  {
    id: "LOG-008",
    status: "alert",
    time: "14:24:10",
    user: "user_06",
    task: "风险",
    taskColor: "#EF4444",
    taskBg: "#EF4444/15",
    model: "GPT-4o",
    tokens: 2800,
    cost: "$0.012",
    latency: "1800ms",
    risk: 88,
    ragHit: false,
    scene: "欺诈检测",
    input: "分析这笔交易是否存在欺诈风险",
    output: "[高危] 检测到多个异常信号：IP地址频繁变化...",
  },
];

const filters = [
  { id: "all", label: "全部" },
  { id: "ok", label: "\u2713 正常" },
  { id: "warn", label: "\u26A0 告警" },
  { id: "alert", label: "\uD83D\uDEA8 高危" },
];

interface LogsPageProps {
  toast: (msg: string) => void;
}

export default function LogsPage({ toast }: LogsPageProps) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.status === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">
          LLM 调用日志
        </h2>
        <button
          onClick={() => toast("CSV 导出中...")}
          className="px-3 py-1.5 bg-[#18181C] border border-[#27272F] rounded-lg text-[11px] font-medium text-[#8B8B99] hover:text-[#EAEAEF] hover:border-[#333340] transition-all cursor-pointer"
        >
          导出 CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filter === f.id
                ? "bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30"
                : "bg-[#18181C] text-[#8B8B99] border border-[#27272F] hover:text-[#EAEAEF]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Split layout */}
      <div className="flex gap-4">
        {/* Table */}
        <div className={`${selected ? "w-[60%]" : "w-full"} transition-all`}>
          <div className="bg-[#18181C] border border-[#27272F] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272F]">
                  {[
                    "",
                    "时间",
                    "用户",
                    "任务",
                    "模型",
                    "Tokens",
                    "成本",
                    "延迟",
                    "风险",
                    "RAG",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelected(log)}
                    className={`border-b border-[#27272F]/50 hover:bg-[#1E1E24] cursor-pointer transition-colors ${
                      selected?.id === log.id ? "bg-[#1E1E24]" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <StatusDot status={log.status} />
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#8B8B99] font-mono">
                      {log.time}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#EAEAEF]">
                      {log.user}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        text={log.task}
                        color={log.taskColor}
                        bg={`${log.taskColor}20`}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#EAEAEF] font-mono">
                      {log.model}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#8B8B99]">
                      {log.tokens.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#F59E0B]">
                      {log.cost}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#8B8B99]">
                      {log.latency}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[11px] font-medium ${
                          log.risk >= 80
                            ? "text-[#EF4444]"
                            : log.risk >= 50
                            ? "text-[#F59E0B]"
                            : "text-[#22C55E]"
                        }`}
                      >
                        {log.risk}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[11px]">
                      {log.ragHit ? (
                        <span className="text-[#22C55E]">HIT</span>
                      ) : (
                        <span className="text-[#55556A]">MISS</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-[40%] bg-[#18181C] border border-[#27272F] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#EAEAEF]">
                {selected.id}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-[#55556A] hover:text-[#EAEAEF] cursor-pointer text-sm"
              >
                x
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-[#55556A] mb-0.5">用户</div>
                <div className="text-[12px] text-[#EAEAEF]">
                  {selected.user}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#55556A] mb-0.5">时间</div>
                <div className="text-[12px] text-[#EAEAEF]">
                  {selected.time}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#55556A] mb-0.5">任务</div>
                <Badge
                  text={selected.task}
                  color={selected.taskColor}
                  bg={`${selected.taskColor}20`}
                />
              </div>
              <div>
                <div className="text-[10px] text-[#55556A] mb-0.5">场景</div>
                <div className="text-[12px] text-[#EAEAEF]">
                  {selected.scene}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#55556A] mb-0.5">模型</div>
                <div className="text-[12px] text-[#EAEAEF] font-mono">
                  {selected.model}
                </div>
              </div>
            </div>

            {/* Input box */}
            <div>
              <div className="text-[10px] text-[#55556A] mb-1 uppercase tracking-wider">
                Input
              </div>
              <div className="bg-[#111114] border border-[#27272F] rounded-lg p-3 text-[11px] text-[#8B8B99] font-mono leading-relaxed">
                {selected.input}
              </div>
            </div>

            {/* Output box */}
            <div>
              <div className="text-[10px] text-[#55556A] mb-1 uppercase tracking-wider">
                Output
              </div>
              <div className="bg-[#111114] border border-[#27272F] rounded-lg p-3 text-[11px] text-[#EAEAEF] font-mono leading-relaxed">
                {selected.output}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#111114] border border-[#27272F] rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-[#55556A] mb-0.5">Tokens</div>
                <div className="text-[13px] font-bold text-[#EAEAEF]">
                  {selected.tokens.toLocaleString()}
                </div>
              </div>
              <div className="bg-[#111114] border border-[#27272F] rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-[#55556A] mb-0.5">成本</div>
                <div className="text-[13px] font-bold text-[#F59E0B]">
                  {selected.cost}
                </div>
              </div>
              <div className="bg-[#111114] border border-[#27272F] rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-[#55556A] mb-0.5">延迟</div>
                <div className="text-[13px] font-bold text-[#EAEAEF]">
                  {selected.latency}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
