"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface PromptLayer {
  id: string;
  label: string;
  description: string;
  value: string;
}

interface PromptVersion {
  id: string;
  version: string;
  changes: string;
  status: "active" | "draft" | "archived";
  createdAt: string;
}

interface ABPanel {
  label: string;
  version: string;
  sampleSize: number;
  responseQuality: number;
  satisfaction: number;
  avgLatency: string;
  status: string;
}

/* ── Default layers (used when editor is empty) ── */
const defaultLayers: PromptLayer[] = [
  {
    id: "system_persona",
    label: "System Persona",
    description: "系统角色设定",
    value: "你是 VietBridge AI，一个专业的越南-中国跨境商务助手。你精通越南语和中文，了解越南的商业环境、法律法规和文化习俗。始终保持专业、准确、有礼貌的态度。",
  },
  {
    id: "user_memory",
    label: "User Memory",
    description: "用户记忆层",
    value: "用户偏好: {preferences}\n历史交互摘要: {history_summary}\n常用场景: {frequent_scenes}\n语言偏好: {language_pref}",
  },
  {
    id: "task_instructions",
    label: "Task Instructions",
    description: "任务指令层",
    value: "当前任务: {task_type}\n请根据以下规则处理用户请求:\n1. 翻译任务需保持商务语境准确性\n2. 风险检测需标注置信度\n3. 回复生成需符合越南商务礼仪",
  },
  {
    id: "scene_rules",
    label: "Scene Rules",
    description: "场景规则层",
    value: "场景: {scene}\n规则:\n- 电商场景: 使用通俗易懂的表达\n- 合同场景: 使用法律术语,保持严谨\n- 客服场景: 保持友善专业的语气",
  },
  {
    id: "tone_control",
    label: "Tone Control",
    description: "语气控制层",
    value: "语气级别: {tone_level}\n正式度: 商务正式\n情感倾向: 中性偏友好\n文化敏感度: 高",
  },
  {
    id: "context",
    label: "Context",
    description: "上下文注入层",
    value: "RAG 检索结果: {rag_results}\n相关知识条目: {knowledge_entries}\n历史对话: {conversation_history}",
  },
  {
    id: "user_input",
    label: "User Input",
    description: "用户输入层",
    value: "{user_message}",
  },
];

/* ── Static AB test data (kept as-is since no AB test API) ── */
const abTestData: { control: ABPanel; variant: ABPanel } = {
  control: {
    label: "Control",
    version: "v1.3",
    sampleSize: 2450,
    responseQuality: 82.5,
    satisfaction: 78.3,
    avgLatency: "420ms",
    status: "运行中",
  },
  variant: {
    label: "Variant",
    version: "v1.4",
    sampleSize: 2380,
    responseQuality: 86.1,
    satisfaction: 83.7,
    avgLatency: "390ms",
    status: "运行中",
  },
};

const tabList = [
  { id: "editor", label: "编辑器" },
  { id: "versions", label: "版本历史" },
  { id: "abtest", label: "AB 测试" },
];

const statusColors: Record<string, { color: string; bg: string }> = {
  active: { color: "#22C55E", bg: "#22C55E20" },
  archived: { color: "#55556A", bg: "#55556A20" },
  draft: { color: "#FBBF24", bg: "#FBBF2420" },
};

const statusLabels: Record<string, string> = {
  active: "生产中",
  archived: "已归档",
  draft: "草稿",
};

interface PromptPageProps {
  toast: (msg: string) => void;
}

export default function PromptPage({ toast }: PromptPageProps) {
  const [tab, setTab] = useState("editor");
  const [layers, setLayers] = useState(defaultLayers);
  const [abTestRunning, setAbTestRunning] = useState(true);

  /* ── API state ── */
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/prompts");
      if (!res.ok) throw new Error("Failed to fetch prompts");
      const data: PromptVersion[] = await res.json();
      setVersions(data);
    } catch (err) {
      console.error(err);
      toast("加载 Prompt 版本失败");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  /* ── Handlers ── */
  const handleLayerChange = (id: string, value: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, value } : l))
    );
  };

  const handleSaveNewVersion = async () => {
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layers }),
      });
      if (!res.ok) throw new Error("Failed to create prompt version");
      toast("新版本已保存");
      fetchVersions();
    } catch (err) {
      console.error(err);
      toast("保存版本失败");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update prompt");
      toast("状态已更新");
      fetchVersions();
    } catch (err) {
      console.error(err);
      toast("更新状态失败");
    }
  };

  /* ── Loading skeleton ── */
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-[#27272F] rounded w-1/3 mb-3" />
          <div className="h-3 bg-[#27272F] rounded w-2/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">Prompt 工作室</h2>
        <button
          onClick={handleSaveNewVersion}
          className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
        >
          保存新版本
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

      {/* ── 编辑器 tab ── */}
      {tab === "editor" && (
        <div className="space-y-4">
          {layers.map((layer, idx) => (
            <div key={layer.id} className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#3B82F620] text-[10px] font-bold text-[#3B82F6]">
                    {idx + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-[#EAEAEF]">{layer.label}</span>
                  <span className="text-[11px] text-[#55556A]">- {layer.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#55556A]">{layer.value.length} 字符</span>
                  <button className="px-2.5 py-1 bg-[#3B82F6] rounded text-[10px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
                    保存
                  </button>
                </div>
              </div>
              <textarea
                value={layer.value}
                onChange={(e) => handleLayerChange(layer.id, e.target.value)}
                className="w-full h-24 bg-[#111114] border border-[#2A2A35] rounded-lg p-3 text-[12px] text-[#EAEAEF] font-mono resize-y focus:outline-none focus:border-[#3B82F6]/50 transition-colors"
                spellCheck={false}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── 版本历史 tab ── */}
      {tab === "versions" && (
        loading ? <LoadingSkeleton /> : (
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
            {versions.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-[#55556A]">暂无版本记录</div>
            ) : (
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="border-b border-[#2A2A35]">
                    {["版本", "变更说明", "创建时间", "状态", "操作"].map((h) => (
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
                  {versions.map((v) => {
                    const sc = statusColors[v.status] || { color: "#8B8B99", bg: "#2A2A35" };
                    return (
                      <tr key={v.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                        <td className="px-4 py-3 text-[12px] font-mono font-semibold text-[#EAEAEF]">{v.version}</td>
                        <td className="px-4 py-3 text-[12px] text-[#8B8B99] max-w-[260px] truncate">{v.changes}</td>
                        <td className="px-4 py-3 text-[11px] text-[#55556A]">{v.createdAt}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ color: sc.color, backgroundColor: sc.bg }}
                          >
                            {statusLabels[v.status] || v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {v.status === "draft" && (
                              <button
                                onClick={() => handleUpdateStatus(v.id, "active")}
                                className="px-2 py-1 rounded text-[10px] font-medium text-[#22C55E] bg-[#22C55E20] hover:bg-[#22C55E30] transition-colors cursor-pointer"
                              >
                                激活
                              </button>
                            )}
                            {v.status === "active" && (
                              <button
                                onClick={() => handleUpdateStatus(v.id, "archived")}
                                className="px-2 py-1 rounded text-[10px] font-medium text-[#55556A] bg-[#55556A20] hover:bg-[#55556A30] transition-colors cursor-pointer"
                              >
                                归档
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      )}

      {/* ── AB 测试 tab ── */}
      {tab === "abtest" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setAbTestRunning(!abTestRunning)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                abTestRunning
                  ? "bg-[#EF4444] text-white hover:bg-[#EF4444]/90"
                  : "bg-[#22C55E] text-white hover:bg-[#22C55E]/90"
              }`}
            >
              {abTestRunning ? "停止测试" : "开始测试"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {([abTestData.control, abTestData.variant] as ABPanel[]).map((panel) => {
              const isVariant = panel.label === "Variant";
              const borderColor = isVariant ? "#A855F7" : "#3B82F6";
              return (
                <div
                  key={panel.label}
                  className="bg-[#18181C] rounded-xl p-5"
                  style={{ border: `1px solid ${borderColor}40` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{ color: borderColor, backgroundColor: `${borderColor}20` }}
                      >
                        {panel.label}
                      </span>
                      <span className="text-[12px] text-[#8B8B99] font-mono">{panel.version}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#22C55E]">{panel.status}</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "样本量", value: panel.sampleSize.toLocaleString(), color: "#EAEAEF" },
                      { label: "响应质量", value: `${panel.responseQuality}%`, color: panel.responseQuality > 85 ? "#22C55E" : "#FBBF24" },
                      { label: "用户满意度", value: `${panel.satisfaction}%`, color: panel.satisfaction > 80 ? "#22C55E" : "#FBBF24" },
                      { label: "平均延迟", value: panel.avgLatency, color: "#8B8B99" },
                    ].map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between py-2 border-b border-[#2A2A35]/50">
                        <span className="text-[11px] text-[#55556A]">{metric.label}</span>
                        <span className="text-[13px] font-semibold" style={{ color: metric.color }}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
