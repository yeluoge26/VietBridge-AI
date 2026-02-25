"use client";

import { useState } from "react";

/* ── Types ── */
interface KnowledgeEntry {
  id: string;
  category: string;
  content: string;
  source: string;
  confidence: number;
  updatedAt: string;
}

interface Rule {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
}

/* ── Mock data ── */
const knowledgeEntries: KnowledgeEntry[] = [
  { id: "kb1", category: "danang_prices", content: "岘港市中心公寓均价 800-1200万越南盾/月", source: "市场调研 2024Q4", confidence: 92, updatedAt: "2024-12-20 14:30" },
  { id: "kb2", category: "danang_prices", content: "海景房溢价约 30-50%", source: "Batdongsan.com", confidence: 88, updatedAt: "2024-12-19 10:15" },
  { id: "kb3", category: "rent_rules", content: "押金不得超过3个月租金(越南法律)", source: "越南民法典 Art.472", confidence: 97, updatedAt: "2024-12-18 09:00" },
  { id: "kb4", category: "rent_rules", content: "房东需提前30天通知涨租", source: "越南住房法 2023", confidence: 95, updatedAt: "2024-12-17 16:45" },
  { id: "kb5", category: "contract_clauses", content: "合同需双语(越中)版本并公证", source: "律师建议模板", confidence: 85, updatedAt: "2024-12-16 11:20" },
  { id: "kb6", category: "contract_clauses", content: "提前终止需支付违约金(通常1-2个月)", source: "标准合同条款库", confidence: 90, updatedAt: "2024-12-15 08:30" },
  { id: "kb7", category: "scam_patterns", content: "虚假房源照片(使用反向图片搜索检测)", source: "用户举报汇总", confidence: 78, updatedAt: "2024-12-14 15:00" },
  { id: "kb8", category: "scam_patterns", content: "要求西联汇款的中介高风险", source: "风控引擎规则库", confidence: 82, updatedAt: "2024-12-13 12:10" },
];

const initialRules: Rule[] = [
  { id: "r1", name: "价格异常检测", condition: "price_deviation > 50% of market_avg", action: "标记为高风险并通知用户", active: true },
  { id: "r2", name: "合同条款缺失", condition: "missing_clauses in [termination, deposit, duration]", action: "插入警告提示并建议补充", active: true },
  { id: "r3", name: "诈骗模式匹配", condition: "match_score >= 0.75 against scam_patterns", action: "阻断交易并上报风控", active: true },
  { id: "r4", name: "信息时效校验", condition: "data_age > 90 days", action: "降低置信度并标注过期", active: true },
  { id: "r5", name: "来源可信度", condition: "source_trust_score < 0.6", action: "要求二次验证", active: false },
];

const categoryColors: Record<string, { color: string; bg: string }> = {
  danang_prices: { color: "#FBBF24", bg: "#FBBF2420" },
  rent_rules: { color: "#3B82F6", bg: "#3B82F620" },
  contract_clauses: { color: "#A855F7", bg: "#A855F720" },
  scam_patterns: { color: "#EF4444", bg: "#EF444420" },
};

const tabList = [
  { id: "data", label: "数据管理" },
  { id: "rules", label: "规则引擎" },
  { id: "rag", label: "RAG 健康" },
];

interface KBPageProps {
  toast: (msg: string) => void;
}

export default function KBPage({ toast }: KBPageProps) {
  const [tab, setTab] = useState("data");
  const [entries, setEntries] = useState(knowledgeEntries);
  const [rules, setRules] = useState(initialRules);

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">知识治理中心</h2>
        <button
          onClick={() => toast("正在同步 Qdrant...")}
          className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
        >
          同步 Qdrant
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-[#111114] border border-[#2A2A35] rounded-lg p-1">
        {tabList.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
              tab === t.id
                ? "bg-[#18181C] text-[#EAEAEF] shadow-sm border border-[#2A2A35]"
                : "text-[#8B8B99] hover:text-[#EAEAEF] border border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 数据管理 tab ── */}
      {tab === "data" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
              + 新增条目
            </button>
          </div>
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-[#2A2A35]">
                  {["类别", "内容", "来源", "置信度", "更新时间", "操作"].map((h) => (
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
                {entries.map((entry) => {
                  const cc = categoryColors[entry.category] || { color: "#8B8B99", bg: "#2A2A35" };
                  return (
                    <tr key={entry.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ color: cc.color, backgroundColor: cc.bg }}
                        >
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#EAEAEF] max-w-[280px] truncate">
                        {entry.content}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#8B8B99]">
                        {entry.source}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-[#2A2A35] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${entry.confidence}%`,
                                backgroundColor:
                                  entry.confidence >= 90
                                    ? "#22C55E"
                                    : entry.confidence >= 80
                                    ? "#FBBF24"
                                    : "#EF4444",
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-[#8B8B99]">{entry.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#55556A]">{entry.updatedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 rounded text-[10px] font-medium text-[#3B82F6] bg-[#3B82F620] hover:bg-[#3B82F630] transition-colors cursor-pointer">
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="px-2 py-1 rounded text-[10px] font-medium text-[#EF4444] bg-[#EF444420] hover:bg-[#EF444430] transition-colors cursor-pointer"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 规则引擎 tab ── */}
      {tab === "rules" && (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-[#18181C] border border-[#2A2A35] rounded-xl px-4 py-3.5 hover:border-[#333340] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[13px] font-semibold text-[#EAEAEF]">{rule.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <span className="text-[10px] text-[#55556A] uppercase tracking-wider">条件: </span>
                      <span className="text-[11px] text-[#8B8B99] font-mono">{rule.condition}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#55556A] uppercase tracking-wider">动作: </span>
                      <span className="text-[11px] text-[#FBBF24]">{rule.action}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ml-4 ${
                    rule.active ? "bg-[#3B82F6]" : "bg-[#2A2A35]"
                  }`}
                  role="switch"
                  aria-checked={rule.active}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      rule.active ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RAG 健康 tab ── */}
      {tab === "rag" && (
        <div className="space-y-4">
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-[#EAEAEF] mb-5">RAG 系统状态</h3>
            <div className="grid grid-cols-5 gap-4">
              {/* 向量库状态 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">向量库状态</div>
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
                    <span className="absolute inset-0 rounded-full opacity-30 animate-ping" style={{ backgroundColor: "#22C55E" }} />
                    <span className="relative w-2 h-2 rounded-full" style={{ backgroundColor: "#22C55E" }} />
                  </span>
                  <span className="text-[16px] font-bold text-[#22C55E]">在线</span>
                </div>
              </div>
              {/* 文档数量 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">文档数量</div>
                <div className="text-[20px] font-bold text-[#EAEAEF]">1,247</div>
              </div>
              {/* 最近索引 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">最近索引</div>
                <div className="text-[16px] font-bold text-[#3B82F6]">2小时前</div>
              </div>
              {/* 平均检索延迟 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">平均检索延迟</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-[#EAEAEF]">45</span>
                  <span className="text-[12px] text-[#55556A]">ms</span>
                </div>
              </div>
              {/* 命中率 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">命中率</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-bold text-[#22C55E]">89.3</span>
                  <span className="text-[12px] text-[#55556A]">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
