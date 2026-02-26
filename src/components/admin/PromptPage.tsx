"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ── */
interface PromptVersion {
  id: string;
  task: string;
  scene: string;
  version: string;
  systemPrompt: string;
  taskPrompt: string;
  scenePrompt: string;
  status: string;
  abGroup: string | null;
  createdAt: string;
}

/* ── 7-Layer Pipeline Definition ── */
const PIPELINE_LAYERS = [
  { num: 1, key: "system",    label: "系统层",   en: "System",    color: "#3B82F6", desc: "核心身份 & 能力定义", editable: true },
  { num: 2, key: "memory",    label: "记忆层",   en: "Memory",    color: "#8B5CF6", desc: "用户偏好 / 身份 / 历史", editable: false },
  { num: 3, key: "task",      label: "任务层",   en: "Task",      color: "#EC4899", desc: "翻译/回复/风险/教学/扫描", editable: true },
  { num: 4, key: "scene",     label: "场景层",   en: "Scene",     color: "#F59E0B", desc: "人称/语气词/正式度/特殊规则", editable: true },
  { num: 5, key: "tone",      label: "语气层",   en: "Tone",      color: "#10B981", desc: "1-10 级语气滑块控制", editable: false },
  { num: 6, key: "knowledge", label: "知识层",   en: "Knowledge", color: "#06B6D4", desc: "RAG 知识库命中注入", editable: false },
  { num: 7, key: "context",   label: "上下文层", en: "Context",   color: "#6366F1", desc: "最近 10 条对话历史", editable: false },
];

/* ── Mappings ── */
const TASK_OPTIONS = [
  { value: "", label: "全部任务" },
  { value: "TRANSLATION", label: "翻译" },
  { value: "REPLY", label: "回复建议" },
  { value: "RISK", label: "风险分析" },
  { value: "LEARN", label: "教学" },
  { value: "SCAN", label: "扫描" },
];

const SCENE_OPTIONS = [
  { value: "", label: "全部场景" },
  { value: "GENERAL", label: "通用" },
  { value: "BUSINESS", label: "商务" },
  { value: "STAFF", label: "员工" },
  { value: "COUPLE", label: "情侣" },
  { value: "RENT", label: "租房" },
  { value: "RESTAURANT", label: "餐厅" },
  { value: "HOSPITAL", label: "医院" },
  { value: "HOUSEKEEPING", label: "家政" },
];

const TASK_CN: Record<string, string> = {
  TRANSLATION: "翻译", REPLY: "回复", RISK: "风险", LEARN: "教学", SCAN: "扫描",
};
const TASK_EN: Record<string, string> = {
  TRANSLATION: "translate", REPLY: "reply", RISK: "risk", LEARN: "learn", SCAN: "scan",
};
const SCENE_CN: Record<string, string> = {
  GENERAL: "通用", BUSINESS: "商务", STAFF: "员工", COUPLE: "情侣",
  RENT: "租房", RESTAURANT: "餐厅", HOSPITAL: "医院", HOUSEKEEPING: "家政",
};
const TASK_COLOR: Record<string, string> = {
  TRANSLATION: "#3B82F6", REPLY: "#A855F7", RISK: "#EF4444", LEARN: "#22C55E", SCAN: "#F59E0B",
};

interface PromptPageProps {
  toast: (msg: string) => void;
}

export default function PromptPage({ toast }: PromptPageProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState("");
  const [sceneFilter, setSceneFilter] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [sceneOpen, setSceneOpen] = useState(false);

  // Edit / create
  const [editing, setEditing] = useState<PromptVersion | null>(null);
  const [editSystem, setEditSystem] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editScene, setEditScene] = useState("");
  const [saving, setSaving] = useState(false);
  const [editTab, setEditTab] = useState(0); // 0=编辑, 1=预览

  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState("TRANSLATION");
  const [newScene, setNewScene] = useState("GENERAL");
  const [newVersion, setNewVersion] = useState("v1.0");
  const [newSystem, setNewSystem] = useState("");
  const [newTaskPrompt, setNewTaskPrompt] = useState("");
  const [newScenePrompt, setNewScenePrompt] = useState("");

  /* ── Fetch ── */
  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (taskFilter) params.set("task", taskFilter);
      if (sceneFilter) params.set("scene", sceneFilter);
      const res = await fetch(`/api/admin/prompts?${params}`);
      if (!res.ok) throw new Error("Failed");
      setVersions(await res.json());
    } catch {
      toast("加载失败");
    } finally {
      setLoading(false);
    }
  }, [taskFilter, sceneFilter, toast]);

  useEffect(() => { fetchVersions(); }, [fetchVersions]);

  useEffect(() => {
    const h = () => { setTaskOpen(false); setSceneOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  /* ── Handlers ── */
  const handleEdit = (v: PromptVersion) => {
    setEditing(v);
    setEditSystem(v.systemPrompt);
    setEditTask(v.taskPrompt);
    setEditScene(v.scenePrompt);
    setEditTab(0);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, systemPrompt: editSystem, taskPrompt: editTask, scenePrompt: editScene }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("保存成功");
      setEditing(null);
      fetchVersions();
    } catch { toast("保存失败"); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (v: PromptVersion) => {
    const s = v.status === "active" ? "archived" : "active";
    try {
      const res = await fetch("/api/admin/prompts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.id, status: s }) });
      if (!res.ok) throw new Error("Failed");
      toast(s === "active" ? "已启用" : "已禁用");
      fetchVersions();
    } catch { toast("操作失败"); }
  };

  const handleDelete = async (v: PromptVersion) => {
    if (!confirm(`确定删除 ${TASK_CN[v.task]} × ${SCENE_CN[v.scene]} ${v.version}？`)) return;
    try {
      const res = await fetch(`/api/admin/prompts?id=${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast("已删除");
      fetchVersions();
    } catch { toast("删除失败"); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask, scene: newScene, version: newVersion, systemPrompt: newSystem, taskPrompt: newTaskPrompt, scenePrompt: newScenePrompt, status: "draft" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("创建成功");
      setShowNew(false);
      setNewSystem(""); setNewTaskPrompt(""); setNewScenePrompt("");
      fetchVersions();
    } catch { toast("创建失败"); }
    finally { setSaving(false); }
  };

  /* ── Build preview of assembled prompt ── */
  const buildPreview = () => {
    if (!editing) return "";
    const taskLabel = TASK_CN[editing.task] || editing.task;
    const sceneLabel = SCENE_CN[editing.scene] || editing.scene;
    return [
      `━━━ Layer 1: 系统层 (System) ━━━`,
      editSystem || "(空)",
      "",
      `━━━ Layer 2: 记忆层 (Memory) ━━━  [运行时注入]`,
      `用户信息：\n- 身份：在越华人\n- 所在城市：岘港\n- 偏好语气等级：5/10\n- 账户类型：{isPro ? "Pro会员" : "免费用户"}`,
      "",
      `━━━ Layer 3: 任务层 (Task) — ${taskLabel} ━━━`,
      editTask || "(空)",
      "",
      `━━━ Layer 4: 场景层 (Scene) — ${sceneLabel} ━━━`,
      editScene || "(空)",
      "",
      `━━━ Layer 5: 语气层 (Tone) ━━━  [运行时注入]`,
      `语气等级：{tone}/10 - {toneLabel}\n{根据等级选择口语化/标准/正式表达}`,
      "",
      `━━━ Layer 6: 知识层 (Knowledge) ━━━  [RAG 自动注入]`,
      `{knowledgeBase.search(userInput) → 匹配条目列表}`,
      "",
      `━━━ Layer 7: 上下文层 (Context) ━━━  [运行时注入]`,
      `{对话历史最近10条}`,
      "",
      `━━━ Layer 8: 输入层 (Input) ━━━`,
      `{用户输入内容}`,
    ].join("\n");
  };

  /* ── Dropdown ── */
  const Dropdown = ({ options, value, open, setOpen, onChange }: {
    options: { value: string; label: string }[]; value: string; open: boolean;
    setOpen: (v: boolean) => void; onChange: (v: string) => void;
  }) => (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] hover:border-[#3B82F6]/50 transition-colors cursor-pointer min-w-[100px]">
        <span>{options.find((o) => o.value === value)?.label}</span>
        <svg className="w-3 h-3 text-[#55556A] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-[#18181C] border border-[#27272F] rounded-lg shadow-xl z-50 min-w-[120px] overflow-hidden">
          {options.map((opt) => (
            <button key={opt.value} onClick={(e) => { e.stopPropagation(); onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${opt.value === value ? "bg-[#3B82F6] text-white" : "text-[#EAEAEF] hover:bg-[#27272F]"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  /* ── Layer editor block ── */
  const LayerEditor = ({ num, color, en, desc, value, onChange, placeholder }: {
    num: number; color: string; en: string; desc: string;
    value: string; onChange: (v: string) => void; placeholder?: string;
  }) => (
    <div className="relative">
      {/* Connector line */}
      {num > 1 && <div className="absolute -top-4 left-5 w-px h-4" style={{ backgroundColor: `${color}30` }} />}
      <div className="bg-[#18181C] border rounded-xl p-4 transition-colors" style={{ borderColor: `${color}30` }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: color }}>{num}</span>
          <span className="text-[12px] font-semibold text-[#EAEAEF]">{en}</span>
          <span className="text-[10px] text-[#55556A] ml-1">{desc}</span>
          <span className="text-[10px] text-[#55556A] ml-auto">{value.length} 字符</span>
        </div>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full h-32 bg-[#111114] border border-[#27272F] rounded-lg p-3 text-[12px] text-[#EAEAEF] font-mono resize-y focus:outline-none transition-colors"
          style={{ ["--tw-ring-color" as string]: `${color}50` }}
          onFocus={(e) => { e.target.style.borderColor = `${color}60`; }}
          onBlur={(e) => { e.target.style.borderColor = "#27272F"; }}
          spellCheck={false}
        />
      </div>
    </div>
  );

  /* ── Runtime layer placeholder ── */
  const RuntimeLayer = ({ num, color, en, label, desc }: {
    num: number; color: string; en: string; label: string; desc: string;
  }) => (
    <div className="relative">
      <div className="absolute -top-4 left-5 w-px h-4" style={{ backgroundColor: `${color}20` }} />
      <div className="bg-[#111114] border border-dashed rounded-xl px-4 py-3 flex items-center gap-3" style={{ borderColor: `${color}30` }}>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold border" style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}>{num}</span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium" style={{ color }}>{en}</span>
            <span className="text-[10px] text-[#55556A]">{label}</span>
          </div>
          <p className="text-[10px] text-[#444455] mt-0.5">{desc}</p>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full border" style={{ color: `${color}90`, borderColor: `${color}30`, backgroundColor: `${color}08` }}>运行时</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-[18px] font-bold text-[#EAEAEF]">Prompt Studio</h2>
        <p className="text-[12px] text-[#55556A] mt-1">管理 7 层 Prompt 模板 — 可编辑的 3 层存储在数据库，其余 4 层运行时动态注入</p>
      </div>

      {/* ── Pipeline Overview ── */}
      <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[11px] font-semibold text-[#8B8B99]">PROMPT PIPELINE</span>
          <span className="text-[10px] text-[#55556A]">用户请求 → 7 层组装 → LLM 调用</span>
        </div>
        <div className="flex items-center gap-0">
          {PIPELINE_LAYERS.map((layer, idx) => (
            <div key={layer.key} className="flex items-center">
              <div className={`relative group flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg transition-all ${layer.editable ? "bg-[#111114] border border-[#27272F]" : ""}`}>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: layer.color }}>{layer.num}</span>
                  <span className="text-[10px] font-medium text-[#EAEAEF]">{layer.label}</span>
                </div>
                <span className="text-[9px] text-[#55556A] leading-tight text-center max-w-[80px]">{layer.desc}</span>
                {layer.editable && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-[#18181C] flex items-center justify-center">
                    <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  </span>
                )}
              </div>
              {idx < PIPELINE_LAYERS.length - 1 && (
                <svg className="w-4 h-4 text-[#27272F] flex-shrink-0 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              )}
            </div>
          ))}
          <svg className="w-4 h-4 text-[#27272F] flex-shrink-0 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <div className="flex flex-col items-center gap-1 px-2.5 py-2 bg-[#22C55E10] border border-[#22C55E30] rounded-lg">
            <span className="text-[10px] font-bold text-[#22C55E]">LLM</span>
            <span className="text-[9px] text-[#55556A]">Qwen / GPT-4o</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Dropdown options={TASK_OPTIONS} value={taskFilter} open={taskOpen} setOpen={setTaskOpen} onChange={setTaskFilter} />
        <Dropdown options={SCENE_OPTIONS} value={sceneFilter} open={sceneOpen} setOpen={setSceneOpen} onChange={setSceneFilter} />
        <button onClick={() => setShowNew(true)} className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[12px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
          + 新增 Prompt
        </button>
        <span className="text-[11px] text-[#55556A] ml-auto">{versions.length} 条模板</span>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#18181C] border border-[#27272F] rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#27272F] border-t-[#3B82F6] rounded-full animate-spin" />
            <p className="text-[12px] text-[#55556A] mt-2">加载中…</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="px-4 py-12 text-center text-[13px] text-[#55556A]">暂无 Prompt 数据</div>
        ) : (
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#27272F]">
                {["ID", "任务", "场景", "版本", "AB组", "状态", "操作"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {versions.map((v, idx) => {
                const tc = TASK_COLOR[v.task] || "#8B8B99";
                return (
                  <tr key={v.id} className="border-b border-[#27272F] hover:bg-[#1E1E24] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[#55556A]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium" style={{ color: tc, backgroundColor: `${tc}15` }}>
                        {TASK_CN[v.task] || v.task}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-medium text-[#EAEAEF]">{SCENE_CN[v.scene] || v.scene}</td>
                    <td className="px-4 py-3 text-[12px] font-mono text-[#EAEAEF]">{v.version}</td>
                    <td className="px-4 py-3 text-[12px] text-[#55556A]">{v.abGroup || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium ${v.status === "active" ? "text-[#22C55E]" : v.status === "draft" ? "text-[#FBBF24]" : "text-[#55556A]"}`}>
                        {v.status === "active" ? "启用" : v.status === "draft" ? "草稿" : "禁用"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(v)} className="px-2.5 py-1 rounded text-[11px] font-medium text-[#3B82F6] bg-[#3B82F620] hover:bg-[#3B82F630] transition-colors cursor-pointer">编辑</button>
                        <button onClick={() => handleToggleStatus(v)} className="px-2.5 py-1 rounded text-[11px] font-medium text-[#F59E0B] bg-[#F59E0B20] hover:bg-[#F59E0B30] transition-colors cursor-pointer">
                          {v.status === "active" ? "禁用" : "启用"}
                        </button>
                        <button onClick={() => handleDelete(v)} className="px-2.5 py-1 rounded text-[11px] font-medium text-white bg-[#EF4444] hover:bg-[#EF4444]/80 transition-colors cursor-pointer">删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#0D0D10] border border-[#27272F] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex-shrink-0 border-b border-[#27272F] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ color: TASK_COLOR[editing.task] || "#8B8B99", backgroundColor: `${TASK_COLOR[editing.task] || "#8B8B99"}15` }}>
                  {TASK_CN[editing.task] || editing.task}
                </span>
                <span className="text-[12px] text-[#8B8B99]">{SCENE_CN[editing.scene] || editing.scene}</span>
                <span className="text-[11px] font-mono text-[#55556A]">{editing.version}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Tab: 编辑 / 预览 */}
                <div className="flex bg-[#18181C] rounded-lg border border-[#27272F] p-0.5">
                  {["编辑", "预览"].map((t, i) => (
                    <button key={t} onClick={() => setEditTab(i)}
                      className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${editTab === i ? "bg-[#27272F] text-[#EAEAEF]" : "text-[#55556A] hover:text-[#EAEAEF]"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <button onClick={() => setEditing(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#55556A] hover:text-[#EAEAEF] hover:bg-[#27272F] cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {editTab === 0 ? (
                /* ── Edit tab: 7-layer chain ── */
                <div className="space-y-4">
                  <LayerEditor num={1} color="#3B82F6" en="System Prompt" desc="核心身份 & 能力定义"
                    value={editSystem} onChange={setEditSystem} placeholder="系统角色设定…" />

                  <RuntimeLayer num={2} color="#8B5CF6" en="Memory" label="记忆层" desc="用户偏好、身份、历史 — 从用户数据自动注入" />

                  <LayerEditor num={3} color="#EC4899" en="Task Prompt" desc={`任务指令 — ${TASK_CN[editing.task] || editing.task}`}
                    value={editTask} onChange={setEditTask} placeholder="任务指令…" />

                  <LayerEditor num={4} color="#F59E0B" en="Scene Prompt" desc={`场景规则 — ${SCENE_CN[editing.scene] || editing.scene}`}
                    value={editScene} onChange={setEditScene} placeholder="场景规则…" />

                  <RuntimeLayer num={5} color="#10B981" en="Tone" label="语气层" desc="根据用户语气滑块 (1-10) 动态生成" />
                  <RuntimeLayer num={6} color="#06B6D4" en="Knowledge" label="知识层" desc="RAG 知识库匹配结果自动注入" />
                  <RuntimeLayer num={7} color="#6366F1" en="Context" label="上下文层" desc="最近 10 条对话历史自动注入" />
                </div>
              ) : (
                /* ── Preview tab: assembled prompt ── */
                <div>
                  <p className="text-[11px] text-[#55556A] mb-3">完整 Prompt 组装预览 — 灰色部分为运行时动态填充</p>
                  <pre className="bg-[#111114] border border-[#27272F] rounded-xl p-4 text-[11px] text-[#EAEAEF] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[60vh]">
                    {buildPreview()}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex-shrink-0 border-t border-[#27272F] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-[#55556A]">
                <span>System: {editSystem.length} 字</span>
                <span className="text-[#27272F]">|</span>
                <span>Task: {editTask.length} 字</span>
                <span className="text-[#27272F]">|</span>
                <span>Scene: {editScene.length} 字</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] hover:text-[#EAEAEF] border border-[#27272F] cursor-pointer transition-colors">取消</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-[#3B82F6] rounded-lg text-[12px] font-medium text-white hover:bg-[#3B82F6]/90 disabled:opacity-50 cursor-pointer transition-colors">
                  {saving ? "保存中…" : "保存"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Prompt Modal ── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-[#0D0D10] border border-[#27272F] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 border-b border-[#27272F] px-6 py-4 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#EAEAEF]">新增 Prompt</h3>
              <button onClick={() => setShowNew(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#55556A] hover:text-[#EAEAEF] hover:bg-[#27272F] cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">任务</label>
                  <select value={newTask} onChange={(e) => setNewTask(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {TASK_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">场景</label>
                  <select value={newScene} onChange={(e) => setNewScene(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] focus:outline-none focus:border-[#3B82F6]/50">
                    {SCENE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#55556A] mb-1 block">版本</label>
                  <input value={newVersion} onChange={(e) => setNewVersion(e.target.value)} className="w-full px-3 py-2 bg-[#18181C] border border-[#27272F] rounded-lg text-[12px] text-[#EAEAEF] font-mono focus:outline-none focus:border-[#3B82F6]/50" />
                </div>
              </div>
              <LayerEditor num={1} color="#3B82F6" en="System Prompt" desc="核心身份 & 能力定义"
                value={newSystem} onChange={setNewSystem} placeholder="系统角色设定…" />
              <LayerEditor num={3} color="#EC4899" en="Task Prompt" desc="任务指令"
                value={newTaskPrompt} onChange={setNewTaskPrompt} placeholder="任务指令…" />
              <LayerEditor num={4} color="#F59E0B" en="Scene Prompt" desc="场景规则"
                value={newScenePrompt} onChange={setNewScenePrompt} placeholder="场景规则…" />
            </div>
            <div className="flex-shrink-0 border-t border-[#27272F] px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-[12px] text-[#8B8B99] hover:text-[#EAEAEF] border border-[#27272F] cursor-pointer">取消</button>
              <button onClick={handleCreate} disabled={saving} className="px-5 py-2 bg-[#3B82F6] rounded-lg text-[12px] font-medium text-white hover:bg-[#3B82F6]/90 disabled:opacity-50 cursor-pointer">
                {saving ? "创建中…" : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
