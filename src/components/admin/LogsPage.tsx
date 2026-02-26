"use client";

import { useState, useEffect, useCallback } from "react";
import StatusDot from "./StatusDot";
import Badge from "./Badge";

/* ── API response types ── */
interface ApiLogEntry {
  id: string;
  userId: string;
  taskType: "TRANSLATION" | "REPLY" | "RISK" | "LEARN" | "SCAN";
  sceneType:
    | "GENERAL"
    | "BUSINESS"
    | "STAFF"
    | "COUPLE"
    | "RESTAURANT"
    | "RENT"
    | "HOSPITAL"
    | "HOUSEKEEPING";
  modelUsed: string;
  input: string;
  output: string;
  tokensPrompt: number;
  tokensCompletion: number;
  cost: number;
  latency: number;
  riskScore: number | null;
  ragHit: boolean;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  logs: ApiLogEntry[];
  pagination: Pagination;
}

/* ── Display types ── */
interface LogEntry {
  id: string;
  status: "ok" | "warn" | "alert";
  time: string;
  user: string;
  task: string;
  taskColor: string;
  model: string;
  tokens: number;
  cost: string;
  latency: string;
  latencyMs: number;
  risk: number;
  ragHit: boolean;
  scene: string;
  input: string;
  output: string;
}

/* ── Task type mapping ── */
const TASK_MAP: Record<
  ApiLogEntry["taskType"],
  { label: string; color: string }
> = {
  TRANSLATION: { label: "翻译", color: "#3B82F6" },
  REPLY: { label: "回复", color: "#A855F7" },
  RISK: { label: "风险", color: "#EF4444" },
  LEARN: { label: "教学", color: "#22C55E" },
  SCAN: { label: "扫描", color: "#F59E0B" },
};

/* ── Scene type mapping ── */
const SCENE_MAP: Record<ApiLogEntry["sceneType"], string> = {
  GENERAL: "通用",
  BUSINESS: "商务",
  STAFF: "员工",
  COUPLE: "情侣",
  RESTAURANT: "餐厅",
  RENT: "租房",
  HOSPITAL: "医院",
  HOUSEKEEPING: "家政",
};

/* ── Derive StatusDot status from API data ── */
function deriveStatus(apiLog: ApiLogEntry): "ok" | "warn" | "alert" {
  if (apiLog.status !== "ok") return "alert";
  if (apiLog.latency > 2000) return "alert";
  if (apiLog.latency > 1000) return "warn";
  return "ok";
}

/* ── Transform API entry to display entry ── */
function toDisplayEntry(apiLog: ApiLogEntry): LogEntry {
  const taskInfo = TASK_MAP[apiLog.taskType] ?? {
    label: apiLog.taskType,
    color: "#8B8B99",
  };
  const date = new Date(apiLog.createdAt);
  const time = date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return {
    id: apiLog.id,
    status: deriveStatus(apiLog),
    time,
    user: apiLog.user?.name ?? apiLog.user?.email ?? apiLog.userId,
    task: taskInfo.label,
    taskColor: taskInfo.color,
    model: apiLog.modelUsed,
    tokens: apiLog.tokensPrompt + apiLog.tokensCompletion,
    cost: `$${apiLog.cost.toFixed(3)}`,
    latency: `${Math.round(apiLog.latency)}ms`,
    latencyMs: apiLog.latency,
    risk: apiLog.riskScore ?? 0,
    ragHit: apiLog.ragHit,
    scene: SCENE_MAP[apiLog.sceneType] ?? apiLog.sceneType,
    input: apiLog.input,
    output: apiLog.output,
  };
}

/* ── Filter bar config ── */
const statusFilters = [
  { id: "all", label: "全部" },
  { id: "ok", label: "\u2713 正常" },
  { id: "warn", label: "\u26A0 告警" },
  { id: "alert", label: "\uD83D\uDEA8 高危" },
];

const taskFilters = [
  { id: "all", label: "全部任务" },
  { id: "TRANSLATION", label: "翻译" },
  { id: "REPLY", label: "回复" },
  { id: "RISK", label: "风险" },
  { id: "LEARN", label: "教学" },
  { id: "SCAN", label: "扫描" },
];

/* ── Props ── */
interface LogsPageProps {
  toast: (msg: string) => void;
}

const PAGE_LIMIT = 50;

export default function LogsPage({ toast }: LogsPageProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [taskFilter, setTaskFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LogEntry | null>(null);

  /* ── Fetch logs from API ── */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));
      if (taskFilter !== "all") params.set("task", taskFilter);

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!res.ok) throw new Error(`请求失败 (${res.status})`);

      const data: ApiResponse = await res.json();
      const displayLogs = data.logs.map(toDisplayEntry);
      setLogs(displayLogs);
      setPagination(data.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      setError(msg);
      toast(`加载日志失败: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [page, taskFilter, statusFilter, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* Reset page when filters change */
  useEffect(() => {
    setPage(1);
  }, [statusFilter, taskFilter]);

  /* ── Client-side status filter (API may not support status param) ── */
  const filtered =
    statusFilter === "all"
      ? logs
      : logs.filter((l) => l.status === statusFilter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">
          LLM 调用日志
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchLogs();
              toast("正在刷新...");
            }}
            className="px-3 py-1.5 bg-[#18181C] border border-[#27272F] rounded-lg text-[11px] font-medium text-[#8B8B99] hover:text-[#EAEAEF] hover:border-[#333340] transition-all cursor-pointer"
          >
            刷新
          </button>
          <button
            onClick={() => {
              if (filtered.length === 0) { toast("暂无数据可导出"); return; }
              const header = "ID,时间,用户,任务,模型,Tokens,成本,延迟,风险,RAG,场景";
              const rows = filtered.map((l) =>
                [l.id, l.time, l.user, l.task, l.model, l.tokens, l.cost, l.latency, l.risk, l.ragHit ? "HIT" : "MISS", l.scene]
                  .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                  .join(",")
              );
              const csv = [header, ...rows].join("\n");
              const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `llm-logs-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast("CSV 已导出");
            }}
            className="px-3 py-1.5 bg-[#18181C] border border-[#27272F] rounded-lg text-[11px] font-medium text-[#8B8B99] hover:text-[#EAEAEF] hover:border-[#333340] transition-all cursor-pointer"
          >
            导出 CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Status filters */}
        <div className="flex items-center gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                statusFilter === f.id
                  ? "bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30"
                  : "bg-[#18181C] text-[#8B8B99] border border-[#27272F] hover:text-[#EAEAEF]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task type filters */}
        <div className="flex items-center gap-2">
          {taskFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setTaskFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                taskFilter === f.id
                  ? "bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30"
                  : "bg-[#18181C] text-[#8B8B99] border border-[#27272F] hover:text-[#EAEAEF]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="text-center py-12 text-[#55556A] text-[13px]">
          加载中...
        </div>
      )}
      {error && !loading && (
        <div className="text-center py-12 text-[#EF4444] text-[13px]">
          {error}
        </div>
      )}

      {/* Split layout */}
      {!loading && !error && (
        <div className="flex gap-4">
          {/* Table */}
          <div
            className={`${selected ? "w-[60%]" : "w-full"} transition-all`}
          >
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-3 py-8 text-center text-[12px] text-[#55556A]"
                      >
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filtered.map((log) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-[11px] text-[#55556A]">
                共 {pagination.total.toLocaleString()} 条 / 第{" "}
                {pagination.page} / {pagination.totalPages} 页
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    pagination.page <= 1
                      ? "bg-[#18181C] border-[#27272F] text-[#333340] cursor-not-allowed"
                      : "bg-[#18181C] border-[#27272F] text-[#8B8B99] hover:text-[#EAEAEF] hover:border-[#333340] cursor-pointer"
                  }`}
                >
                  上一页
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                    pagination.page >= pagination.totalPages
                      ? "bg-[#18181C] border-[#27272F] text-[#333340] cursor-not-allowed"
                      : "bg-[#18181C] border-[#27272F] text-[#8B8B99] hover:text-[#EAEAEF] hover:border-[#333340] cursor-pointer"
                  }`}
                >
                  下一页
                </button>
              </div>
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
                  <div className="text-[10px] text-[#55556A] mb-0.5">
                    Tokens
                  </div>
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
      )}
    </div>
  );
}
