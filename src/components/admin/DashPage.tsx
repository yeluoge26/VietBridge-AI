"use client";

import Metric from "./Metric";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

/* ── Mock data ── */
const trendData = [
  { day: "周一", calls: 2100, rag: 68 },
  { day: "周二", calls: 2450, rag: 70 },
  { day: "周三", calls: 2800, rag: 71 },
  { day: "周四", calls: 2600, rag: 69 },
  { day: "周五", calls: 3100, rag: 73 },
  { day: "周六", calls: 2700, rag: 74 },
  { day: "周日", calls: 2660, rag: 72 },
];

const pieData = [
  { name: "翻译", value: 52, color: "#3B82F6" },
  { name: "回复", value: 22, color: "#A855F7" },
  { name: "风险", value: 15, color: "#EF4444" },
  { name: "教学", value: 8, color: "#22C55E" },
  { name: "扫描", value: 3, color: "#F59E0B" },
];

const costTrend = [
  { day: "周一", cost: 5.2 },
  { day: "周二", cost: 6.1 },
  { day: "周三", cost: 7.3 },
  { day: "周四", cost: 6.8 },
  { day: "周五", cost: 8.4 },
  { day: "周六", cost: 5.9 },
  { day: "周日", cost: 6.2 },
];

const models = [
  { name: "Qwen-14B", calls: 8420, pct: 45, cost: "$12.60", latency: "320ms" },
  { name: "GPT-4o", calls: 4210, pct: 23, cost: "$18.40", latency: "890ms" },
  { name: "Qwen-7B", calls: 3150, pct: 17, cost: "$3.20", latency: "180ms" },
  { name: "Claude-3.5", calls: 1840, pct: 10, cost: "$8.10", latency: "720ms" },
  { name: "GPT-3.5", calls: 800, pct: 5, cost: "$0.90", latency: "240ms" },
];

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

export default function DashPage() {
  return (
    <div className="space-y-6">
      {/* ── KPI Row 1 ── */}
      <div className="grid grid-cols-4 gap-4">
        <Metric label="DAU" value="342" delta={12.5} />
        <Metric label="API 调用" value="18,420" delta={15.2} />
        <Metric label="月收入" value="4,280" prefix="$" delta={22.1} />
        <Metric label="Pro 转化" value="10.7" suffix="%" delta={1.2} />
      </div>

      {/* ── KPI Row 2 ── */}
      <div className="grid grid-cols-4 gap-4">
        <Metric label="RAG 命中率" value="72.3" suffix="%" delta={3.1} />
        <Metric label="风险触发" value="234" delta={-5.2} />
        <Metric label="成功率" value="96.8" suffix="%" />
        <Metric label="7日留存" value="45.2" suffix="%" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* 7-day trend */}
        <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">
            7日趋势
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272F" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#55556A", fontSize: 10 }}
                axisLine={{ stroke: "#27272F" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#55556A", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#55556A", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[60, 80]}
              />
              <Tooltip {...tooltipStyle} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="calls"
                stroke="#3B82F6"
                fill="url(#callsGrad)"
                strokeWidth={2}
                name="调用数"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rag"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
                name="RAG%"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task distribution */}
        <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">
            任务分布
          </h3>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] text-[#8B8B99]">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#EAEAEF]">
                    {item.value}%
                  </span>
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
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">
            模型调用排行
          </h3>
          <div className="space-y-3">
            {models.map((m) => (
              <div key={m.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#EAEAEF]">
                    {m.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#8B8B99]">
                      {m.calls.toLocaleString()} 次
                    </span>
                    <span className="text-[10px] text-[#F59E0B]">{m.cost}</span>
                    <span className="text-[10px] text-[#55556A]">
                      {m.latency}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#27272F] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3B82F6] to-[#A855F7] rounded-full"
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost trend */}
        <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
          <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-4">
            成本趋势
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272F" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#55556A", fontSize: 10 }}
                axisLine={{ stroke: "#27272F" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#55556A", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="cost" fill="#A855F7" radius={[4, 4, 0, 0]} name="成本($)" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-[10px] text-[#55556A] mb-1">单次成本</div>
              <div className="text-[14px] font-bold text-[#EAEAEF]">$0.0023</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-[#55556A] mb-1">平均延迟</div>
              <div className="text-[14px] font-bold text-[#EAEAEF]">420ms</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-[#55556A] mb-1">Free:Pro</div>
              <div className="text-[14px] font-bold text-[#EAEAEF]">7.2:1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
