export const TASKS = {
  translate: { label: "翻译", icon: "🌐", color: "#111", description: "中越双语翻译" },
  reply: { label: "回复建议", icon: "💬", color: "#1565C0", description: "AI多风格回复" },
  risk: { label: "风险分析", icon: "🛡️", color: "#FF8A00", description: "防踩坑评估" },
  learn: { label: "教我说", icon: "📖", color: "#6A1B9A", description: "实战越南语" },
} as const;

export type TaskId = keyof typeof TASKS;
