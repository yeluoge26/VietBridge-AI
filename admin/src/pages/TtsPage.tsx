import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/useToast";

/* ── Types ── */
interface TtsModel {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  apiModel: string;
  apiEndpoint: string;
  apiKeyEnv: string;
  voiceZh: string;
  voiceVi: string;
  speed: number;
  isDefault: boolean;
  active: boolean;
}

const EMPTY_FORM: Omit<TtsModel, "id"> = {
  name: "",
  displayName: "",
  provider: "dashscope",
  apiModel: "cosyvoice-v1",
  apiEndpoint: "",
  apiKeyEnv: "DASHSCOPE_API_KEY",
  voiceZh: "longxiaochun",
  voiceVi: "longxiaochun",
  speed: 1.0,
  isDefault: false,
  active: true,
};

export default function TtsPage() {
  const toast = useToast();
  const [models, setModels] = useState<TtsModel[]>([]);
  const [loading, setLoading] = useState(true);

  /* Modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<TtsModel, "id">>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tts-config");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      setModels(json.models || []);
    } catch (err) {
      console.error(err);
      toast("\u52A0\u8F7DTTS\u6A21\u578B\u5931\u8D25");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const openCreate = () => {
    setModalMode("create");
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (m: TtsModel) => {
    setModalMode("edit");
    setEditId(m.id);
    setForm({
      name: m.name,
      displayName: m.displayName,
      provider: m.provider,
      apiModel: m.apiModel,
      apiEndpoint: m.apiEndpoint,
      apiKeyEnv: m.apiKeyEnv,
      voiceZh: m.voiceZh,
      voiceVi: m.voiceVi,
      speed: m.speed,
      isDefault: m.isDefault,
      active: m.active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === "edit" && editId) {
        const res = await fetch("/api/admin/tts-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...form }),
        });
        if (!res.ok) throw new Error("update failed");
        toast("\u5DF2\u66F4\u65B0");
      } else {
        const res = await fetch("/api/admin/tts-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("create failed");
        toast("\u5DF2\u521B\u5EFA");
      }
      setModalOpen(false);
      fetchModels();
    } catch (err) {
      console.error(err);
      toast(modalMode === "edit" ? "\u66F4\u65B0\u5931\u8D25" : "\u521B\u5EFA\u5931\u8D25");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("\u786E\u5B9A\u5220\u9664\u8BE5TTS\u6A21\u578B\uFF1F")) return;
    try {
      const res = await fetch(`/api/admin/tts-config?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toast("\u5DF2\u5220\u9664");
      fetchModels();
    } catch (err) {
      console.error(err);
      toast("\u5220\u9664\u5931\u8D25");
    }
  };

  const setDefault = async (id: string) => {
    try {
      const res = await fetch("/api/admin/tts-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDefault: true }),
      });
      if (!res.ok) throw new Error("update failed");
      toast("\u5DF2\u8BBE\u4E3A\u9ED8\u8BA4");
      fetchModels();
    } catch (err) {
      console.error(err);
      toast("\u8BBE\u7F6E\u5931\u8D25");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2A2A35] border-t-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#EAEAEF]">TTS {"\u8BED\u97F3\u6A21\u578B\u7BA1\u7406"}</h2>
        <div className="flex gap-2">
          <button onClick={fetchModels} className="px-3 py-1.5 bg-[#2A2A35] rounded-lg text-[11px] font-medium text-[#EAEAEF] hover:bg-[#333340] transition-all cursor-pointer">
            {"\u5237\u65B0"}
          </button>
          <button onClick={openCreate} className="px-3 py-1.5 bg-[#3B82F6] rounded-lg text-[11px] font-medium text-white hover:bg-[#3B82F6]/90 transition-all cursor-pointer">
            + {"\u65B0\u589E\u6A21\u578B"}
          </button>
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-[#18181C] border border-[#2A2A35] rounded-xl overflow-hidden">
        {models.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[#55556A]">{"\u6682\u65E0TTS\u6A21\u578B\u914D\u7F6E"}</div>
        ) : (
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-[#2A2A35]">
                {["\u540D\u79F0", "\u663E\u793A\u540D", "\u4F9B\u5E94\u5546", "API\u6A21\u578B", "\u4E2D\u6587\u58F0\u97F3", "\u8D8A\u5357\u6587\u58F0\u97F3", "\u9ED8\u8BA4", "\u72B6\u6001", "\u64CD\u4F5C"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-[#55556A] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-b border-[#2A2A35] hover:bg-[#1E1E24] transition-colors">
                  <td className="px-4 py-3 text-[12px] text-[#EAEAEF] font-mono">{m.name}</td>
                  <td className="px-4 py-3 text-[12px] text-[#EAEAEF]">{m.displayName}</td>
                  <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{m.provider}</td>
                  <td className="px-4 py-3 text-[12px] text-[#8B8B99] font-mono">{m.apiModel}</td>
                  <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{m.voiceZh}</td>
                  <td className="px-4 py-3 text-[12px] text-[#8B8B99]">{m.voiceVi}</td>
                  <td className="px-4 py-3">
                    {m.isDefault ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-[#3B82F6] bg-[#3B82F620]">{"\u9ED8\u8BA4"}</span>
                    ) : (
                      <button onClick={() => setDefault(m.id)} className="text-[10px] text-[#55556A] hover:text-[#EAEAEF] cursor-pointer">{"\u8BBE\u4E3A\u9ED8\u8BA4"}</button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${m.active ? "text-[#22C55E] bg-[#22C55E20]" : "text-[#EF4444] bg-[#EF444420]"}`}>
                      {m.active ? "\u5DF2\u542F\u7528" : "\u5DF2\u7981\u7528"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(m)} className="rounded px-2 py-1 text-[11px] text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 cursor-pointer">{"\u7F16\u8F91"}</button>
                      <button onClick={() => handleDelete(m.id)} className="rounded px-2 py-1 text-[11px] text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10 cursor-pointer">{"\u5220\u9664"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Usage hint */}
      <div className="bg-[#18181C] border border-[#27272F] rounded-xl p-4">
        <h3 className="text-[13px] font-semibold text-[#EAEAEF] mb-2">{"\u524D\u7AEF\u8C03\u7528\u65B9\u5F0F"}</h3>
        <div className="text-[12px] text-[#8B8B99] font-mono bg-[#0C0C0F] rounded-lg p-3">
          POST /api/tts {"{"} text: "...", lang: "zh"|"vi", model?: "cosyvoice-v1" {"}"}
        </div>
        <p className="text-[11px] text-[#55556A] mt-2">{"\u4E0D\u4F20 model \u53C2\u6570\u65F6\u4F7F\u7528\u9ED8\u8BA4\u6A21\u578B\uFF0C\u4F20\u5165 model \u540D\u79F0\u53EF\u6307\u5B9A\u7279\u5B9ATTS\u5F15\u64CE"}</p>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModalOpen(false)}>
          <div className="w-[600px] max-h-[85vh] overflow-y-auto rounded-xl border border-[#27272F] bg-[#18181C] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#EAEAEF]">
                {modalMode === "edit" ? "\u7F16\u8F91TTS\u6A21\u578B" : "\u65B0\u589ETTS\u6A21\u578B"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#55556A] hover:text-[#EAEAEF] text-lg cursor-pointer">x</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">{"\u6A21\u578B\u540D\u79F0"} (unique)</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" placeholder="cosyvoice-v1" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">{"\u663E\u793A\u540D"}</label>
                  <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" placeholder="CosyVoice" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">{"\u4F9B\u5E94\u5546"}</label>
                  <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]">
                    <option value="dashscope">DashScope ({"\u901A\u4E49\u5343\u95EE"})</option>
                    <option value="openai">OpenAI</option>
                    <option value="edge">Edge TTS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">API {"\u6A21\u578B\u540D"}</label>
                  <input value={form.apiModel} onChange={(e) => setForm({ ...form, apiModel: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" placeholder="cosyvoice-v1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">API Endpoint ({"\u7A7A=\u9ED8\u8BA4"})</label>
                  <input value={form.apiEndpoint} onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">API Key {"\u73AF\u5883\u53D8\u91CF"}</label>
                  <input value={form.apiKeyEnv} onChange={(e) => setForm({ ...form, apiKeyEnv: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" placeholder="DASHSCOPE_API_KEY" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">{"\u4E2D\u6587\u58F0\u97F3"}</label>
                  <input value={form.voiceZh} onChange={(e) => setForm({ ...form, voiceZh: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" placeholder="longxiaochun" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">{"\u8D8A\u5357\u6587\u58F0\u97F3"}</label>
                  <input value={form.voiceVi} onChange={(e) => setForm({ ...form, voiceVi: e.target.value })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" placeholder="longxiaochun" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8B8B99] mb-1">{"\u8BED\u901F"}</label>
                  <input type="number" step="0.1" min="0.5" max="2.0" value={form.speed} onChange={(e) => setForm({ ...form, speed: parseFloat(e.target.value) || 1.0 })} className="w-full rounded-lg border border-[#27272F] bg-[#0C0C0F] px-3 py-2 text-[12px] text-[#EAEAEF]" />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
                  <span className="text-[12px] text-[#8B8B99]">{"\u8BBE\u4E3A\u9ED8\u8BA4"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                  <span className="text-[12px] text-[#8B8B99]">{"\u542F\u7528"}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="rounded-lg border border-[#27272F] px-4 py-2 text-[12px] text-[#8B8B99] hover:bg-[#27272F] cursor-pointer">{"\u53D6\u6D88"}</button>
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#3B82F6] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#2563EB] disabled:opacity-50 cursor-pointer">
                {saving ? "\u4FDD\u5B58\u4E2D..." : modalMode === "edit" ? "\u66F4\u65B0" : "\u521B\u5EFA"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
