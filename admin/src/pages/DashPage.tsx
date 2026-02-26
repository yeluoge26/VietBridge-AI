import { useState, useEffect } from "react";
import Metric from "@/components/Metric";
import {
  ComposedChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

/* ── Types matching /api/admin/stats response ── */
interface KPIs {
  totalUsers: number;
  todayCalls: number;
  weekCalls: number;
  totalCost: number;
  knowledgeCount: number;
  promptCount: number;
  riskRuleCount: number;
  totalCalls: number;
  courseCount: number;
}

interface DailyTrend {
  date: string;
  calls: number;
  cost: number;
}

interface TaskDistribution {
  task: string;
  count: number;
}

interface ModelStat {
  model: string;
  calls: number;
  tokens: number;
  cost: number;
  latency: number;
}

interface StatsResponse {
  kpis: KPIs;
  dailyTrend: DailyTrend[];
  taskDistribution: TaskDistribution[];
  modelStats: ModelStat[];
}

/* ── Task name mapping ── */
const TASK_NAME_MAP: Record<string, string> = {
  TRANSLATION: "翻译",
  REPLY: "回复",
  RISK: "风险",
  LEARN: "教学",
  SCAN: "扫描",
};

/* ── Pie chart colors by task ── */
const TASK_COLOR_MAP: Record<string, string> = {
  TRANSLATION: "#3B82F6",
  REPLY: "#A855F7",
  RISK: "#EF4444",
  LEARN: "#22C55E",
  SCAN: "#F59E0B",
};

const FALLBACK_COLORS = ["#3B82F6", "#A855F7", "#EF4444", "#22C55E", "#F59E0B", "#06B6D4", "#EC4899"];

/* ── Tooltip style ── */
const tooltipStyle = {
  contentStyle: {
    background: "#18181C",
    border: "1px solid #27272F",
    borderRadius: 8,
    fontSize: 11,
    color: "#EAEAEF",
  },
  itemStyle: { color: "#EAEAEF" },
};

/* ── Loading spinner ── */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#27272F] border-t-[#3B82F6] rounded-full animate-spin" />
        <span className="text-[12px] text-[#55556A]">加载数据中…</span>
      </div>
    </div>
  );
}

/* ── Helper: format date label (MM-DD) ── */
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DashPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: StatsResponse = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="text-[13px] text-[#F87171]">加载失败: {error ?? "未知错误"}</span>
      </div>
    );
  }

  /* ── Derived data ── */
  const { kpis, dailyTrend, taskDistribution, modelStats } = data;

  const trendData = dailyTrend.map((d) => ({
    day: fmtDate(d.date),
    calls: d.calls,
    cost: d.cost,
  }));

  const costTrend = dailyTrend.map((d) => ({
    day: fmtDate(d.date),
    cost: Number(d.cost.toFixed(2)),
  }));

  const totalTasks = taskDistribution.reduce((s, t) => s + t.count, 0);
  const pieData = taskDistribution.map((t, idx) => ({
    name: TASK_NAME_MAP[t.task] || t.task,
    value: totalTasks > 0 ? Math.round((t.count / totalTasks) * 100) : 0,
    color: TASK_COLOR_MAP[t.task] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
  }));

  const totalModelCalls = modelStats.reduce((s, m) => s + m.calls, 0);
  const models = [...modelStats]
    .sort((a, b) => b.calls - a.calls)
    .map((m) => ({
      name: m.model,
      calls: m.calls,
      pct: totalModelCalls > 0 ? Math.round((m.calls / totalModelCalls) * 100) : 0,
      cost: `$${m.cost.toFixed(2)}`,
      latency: `${Math.round(m.latency)}ms`,
    }));

  const avgCostPerCall =
    kpis.totalCalls > 0 ? (kpis.totalCost / kpis.totalCalls).toFixed(4) : "0";
  const avgLatency =
    modelStats.length > 0
      ? Math.round(
          modelStats.reduce((s, m) => s + m.latency * m.calls, 0) /
            (totalModelCalls || 1)
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ── KPI Row 1: Core Stats ── */}
      <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
        <Metric label="总用户数" value={kpis.totalUsers.toLocaleString()} />
        <Metric label="知识库条目" value={kpis.knowledgeCount.toLocaleString()} />
        <Metric label="Prompt 模板" value={kpis.promptCount.toLocaleString()} />
        <Metric label="风控规则" value={kpis.riskRuleCount.toLocaleString()} />
        <Metric label="课程数量" value={kpis.courseCount.toLocaleString()} />
        <Metric label="总调用次数" value={kpis.totalCalls.toLocaleString()} />
      </div>

      {/* ── KPI Row 2: Operational ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="今日调用" value={kpis.todayCalls.toLocaleString()} />
        <Metric label="本周调用" value={kpis.weekCalls.toLocaleString()} />
        <Metric label="总成本" value={kpis.totalCost.toFixed(2)} prefix="$" />
        <Metric label="平均延迟" value={avgLatency.toString()} suffix="ms" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily trend */}
        <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">每日趋势</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={trendData}>
              <defs>
                <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272F" />
              <XAxis dataKey="day" tick={{ fill: "#55556A", fontSize: 10 }} axisLine={{ stroke: "#27272F" }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#55556A", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#55556A", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area yAxisId="left" type="monotone" dataKey="calls" stroke="#3B82F6" fill="url(#callsGrad)" strokeWidth={2} name="调用数" />
              <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#22C55E" strokeWidth={2} dot={false} name="成本($)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Task distribution */}
        <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">任务分布</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-[#8B8B99]">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#EAEAEF]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Model + Cost Row ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Model list */}
        <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">模型调用排行</h3>
          <div className="space-y-3">
            {models.map((m) => (
              <div key={m.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#EAEAEF]">{m.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#8B8B99]">{m.calls.toLocaleString()} 次</span>
                    <span className="text-[10px] text-[#F59E0B]">{m.cost}</span>
                    <span className="text-[10px] text-[#55556A]">{m.latency}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#27272F] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#A855F7] rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost trend */}
        <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">成本趋势</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272F" />
              <XAxis dataKey="day" tick={{ fill: "#55556A", fontSize: 10 }} axisLine={{ stroke: "#27272F" }} tickLine={false} />
              <YAxis tick={{ fill: "#55556A", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="cost" fill="#A855F7" radius={[4, 4, 0, 0]} name="成本($)" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-[10px] text-[#55556A] mb-1">单次成本</div>
              <div className="text-[14px] font-bold text-[#EAEAEF]">${avgCostPerCall}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-[#55556A] mb-1">平均延迟</div>
              <div className="text-[14px] font-bold text-[#EAEAEF]">{avgLatency}ms</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-[#55556A] mb-1">模型数</div>
              <div className="text-[14px] font-bold text-[#EAEAEF]">{modelStats.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
