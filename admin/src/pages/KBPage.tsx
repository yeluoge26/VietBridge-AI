import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Types ── */
interface KnowledgeEntry {
  id: string;
  category: string;
  key: string;
  valueZh: string;
  valueVi: string;
  source: string | null;
  confidence: number;
  updatedAt: string;
}

const categoryColors: Record<string, { color: string; bg: string; label: string }> = {
  danang_prices: { color: "#FBBF24", bg: "#FBBF2420", label: "价格参考" },
  rent_rules: { color: "#3B82F6", bg: "#3B82F620", label: "租房规则" },
  contract_clauses: { color: "#A855F7", bg: "#A855F720", label: "合同条款" },
  scam_patterns: { color: "#EF4444", bg: "#EF444420", label: "防骗模式" },
};

const tabList = [
  { id: "data", label: "数据管理" },
  { id: "import", label: "导入导出" },
  { id: "rag", label: "RAG 状态" },
];

export default function KBPage() {
  const toast = useToast();
  const [tab, setTab] = useState("data");
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<KnowledgeEntry> | null>(null);
  const [importText, setImportText] = useState("");

  // ── Fetch entries from API ────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to fetch entries", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ── CRUD handlers ─────────────────────────────────────────────────────
  const handleSaveEntry = async () => {
    if (!editingEntry) return;
    const isNew = !editingEntry.id;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch("/api/admin/knowledge", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEntry),
      });
      if (res.ok) {
        toast(isNew ? "条目已创建" : "条目已更新");
        setEditingEntry(null);
        fetchEntries();
      } else {
        const err = await res.json();
        toast(`错误: ${err.error}`);
      }
    } catch {
      toast("保存失败");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/knowledge?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("条目已删除");
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      toast("删除失败");
    }
  };

  // ── Import/Export handlers ────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/knowledge/import-export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vietbridge-kb-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast("导出成功");
      }
    } catch {
      toast("导出失败");
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importText);
      const res = await fetch("/api/admin/knowledge/import-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        toast(`导入完成: 新增${result.created}条, 更新${result.updated}条, 失败${result.errors}条`);
        setImportText("");
        fetchEntries();
      } else {
        const err = await res.json();
        toast(`导入失败: ${err.error}`);
      }
    } catch {
      toast("JSON格式错误");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">知识治理中心</h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#55556A]">
            共 {entries.length} 条记录
          </span>
          <button
            onClick={fetchEntries}
            className="px-3 py-1.5 bg-[#2A2A35] rounded-lg text-[11px] font-medium text-[#EAEAEF] hover:bg-[#333340] transition-all cursor-pointer"
          >
            刷新
          </button>
        </div>
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
            <button
              onClick={() =>
                setEditingEntry({
                  category: "danang_prices",
                  key: "",
                  valueZh: "",
                  valueVi: "",
                  source: "",
                  confidence: 0.85,
                })
              }
              className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
            >
              + 新增条目
            </button>
          </div>

          {/* Edit form */}
          {editingEntry && (
            <div className="bg-[#18181C] border border-[#3B82F6] rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#55556A] uppercase tracking-wider">类别</label>
                  <select
                    value={editingEntry.category || ""}
                    onChange={(e) =>
                      setEditingEntry({ ...editingEntry, category: e.target.value })
                    }
                    className="w-full mt-1 px-2 py-1.5 bg-[#111114] border border-[#2A2A35] rounded text-[12px] text-[#EAEAEF]"
                  >
                    {Object.entries(categoryColors).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#55556A] uppercase tracking-wider">键名</label>
                  <input
                    value={editingEntry.key || ""}
                    onChange={(e) =>
                      setEditingEntry({ ...editingEntry, key: e.target.value })
                    }
                    className="w-full mt-1 px-2 py-1.5 bg-[#111114] border border-[#2A2A35] rounded text-[12px] text-[#EAEAEF]"
                    placeholder="如: mi_quang"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#55556A] uppercase tracking-wider">中文内容</label>
                <textarea
                  value={editingEntry.valueZh || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, valueZh: e.target.value })
                  }
                  className="w-full mt-1 px-2 py-1.5 bg-[#111114] border border-[#2A2A35] rounded text-[12px] text-[#EAEAEF] min-h-[60px]"
                  placeholder="中文知识内容"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#55556A] uppercase tracking-wider">越南语内容</label>
                <textarea
                  value={editingEntry.valueVi || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, valueVi: e.target.value })
                  }
                  className="w-full mt-1 px-2 py-1.5 bg-[#111114] border border-[#2A2A35] rounded text-[12px] text-[#EAEAEF] min-h-[60px]"
                  placeholder="Nội dung tiếng Việt"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#55556A] uppercase tracking-wider">来源</label>
                  <input
                    value={editingEntry.source || ""}
                    onChange={(e) =>
                      setEditingEntry({ ...editingEntry, source: e.target.value })
                    }
                    className="w-full mt-1 px-2 py-1.5 bg-[#111114] border border-[#2A2A35] rounded text-[12px] text-[#EAEAEF]"
                    placeholder="数据来源"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#55556A] uppercase tracking-wider">置信度</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={editingEntry.confidence || 0.85}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        confidence: parseFloat(e.target.value),
                      })
                    }
                    className="w-full mt-1 px-2 py-1.5 bg-[#111114] border border-[#2A2A35] rounded text-[12px] text-[#EAEAEF]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingEntry(null)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#8B8B99] hover:text-[#EAEAEF] transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="px-4 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
                >
                  保存
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2A2A35] border-t-[#3B82F6]" />
            </div>
          ) : (
            <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="border-b border-[#2A2A35]">
                    {["类别", "键名", "中文内容", "来源", "置信度", "更新时间", "操作"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const cc = categoryColors[entry.category] || {
                      color: "#8B8B99",
                      bg: "#2A2A35",
                      label: entry.category,
                    };
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ color: cc.color, backgroundColor: cc.bg }}
                          >
                            {cc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#8B8B99] font-mono">
                          {entry.key}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#EAEAEF] max-w-[280px] truncate">
                          {entry.valueZh}
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
                                  width: `${Math.round(entry.confidence * 100)}%`,
                                  backgroundColor:
                                    entry.confidence >= 0.9
                                      ? "#22C55E"
                                      : entry.confidence >= 0.8
                                      ? "#FBBF24"
                                      : "#EF4444",
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-[#8B8B99]">
                              {Math.round(entry.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#55556A]">
                          {new Date(entry.updatedAt).toLocaleDateString("zh-CN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="px-2 py-1 rounded text-[10px] font-medium text-[#3B82F6] bg-[#3B82F620] hover:bg-[#3B82F630] transition-colors cursor-pointer"
                            >
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
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-[#55556A]">
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 导入导出 tab ── */}
      {tab === "import" && (
        <div className="space-y-4">
          {/* Export */}
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5 space-y-3">
            <h3 className="text-[14px] font-semibold text-[#EAEAEF]">导出知识库</h3>
            <p className="text-[12px] text-[#8B8B99]">
              将所有知识库条目导出为 JSON 文件，可用于备份或迁移。
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-[#3B82F6] rounded-lg text-[12px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer"
            >
              下载 JSON
            </button>
          </div>

          {/* Import */}
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5 space-y-3">
            <h3 className="text-[14px] font-semibold text-[#EAEAEF]">导入知识库</h3>
            <p className="text-[12px] text-[#8B8B99]">
              粘贴 JSON 数据批量导入。格式: {`{"entries": [{"category", "key", "valueZh", "valueVi", "confidence", "source"}]}`}
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full px-3 py-2 bg-[#111114] border border-[#2A2A35] rounded-lg text-[12px] text-[#EAEAEF] font-mono min-h-[120px] resize-y"
              placeholder='{"entries": [...]}'
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="px-4 py-2 bg-[#22C55E] rounded-lg text-[12px] font-medium text-white hover:bg-[#22C55E]/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              批量导入
            </button>
          </div>
        </div>
      )}

      {/* ── RAG 状态 tab ── */}
      {tab === "rag" && (
        <div className="space-y-4">
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-[#EAEAEF] mb-5">RAG 系统状态</h3>
            <div className="grid grid-cols-4 gap-4">
              {/* 知识库状态 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">
                  知识库状态
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
                    <span
                      className="absolute inset-0 rounded-full opacity-30 animate-ping"
                      style={{ backgroundColor: "#22C55E" }}
                    />
                    <span
                      className="relative w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#22C55E" }}
                    />
                  </span>
                  <span className="text-[16px] font-bold text-[#22C55E]">在线</span>
                </div>
              </div>
              {/* 条目数量 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">
                  DB 条目数
                </div>
                <div className="text-[20px] font-bold text-[#EAEAEF]">{entries.length}</div>
              </div>
              {/* 本地知识条目 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">
                  本地 KB 条目
                </div>
                <div className="text-[20px] font-bold text-[#3B82F6]">28+</div>
              </div>
              {/* 检索模式 */}
              <div className="bg-[#111114] border border-[#2A2A35] rounded-lg p-4">
                <div className="text-[10px] text-[#55556A] uppercase tracking-wider mb-2">
                  检索模式
                </div>
                <div className="text-[14px] font-bold text-[#EAEAEF]">关键词匹配</div>
                <div className="text-[10px] text-[#55556A] mt-1">本地+数据库双源</div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl p-5">
            <h3 className="text-[14px] font-semibold text-[#EAEAEF] mb-4">分类统计</h3>
            <div className="space-y-3">
              {Object.entries(categoryColors).map(([key, val]) => {
                const count = entries.filter((e) => e.category === key).length;
                const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span
                      className="inline-flex w-20 items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ color: val.color, backgroundColor: val.bg }}
                    >
                      {val.label}
                    </span>
                    <div className="flex-1 h-2 bg-[#2A2A35] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: val.color,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-[#8B8B99] w-16 text-right">
                      {count} 条 ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
