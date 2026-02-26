import { useState } from "react";
import RiskGauge from "@/components/detail/RiskGauge";
import KBViewer from "@/components/detail/KBViewer";
import PromptViewer from "@/components/detail/PromptViewer";
import ProactiveWarnings from "@/components/detail/ProactiveWarnings";
import ContextRef from "@/components/detail/ContextRef";

interface RiskCardProps {
  data: {
    score: number;
    context: string;
    situation: string;
    factors: Array<{ label: string; weight: number; active: boolean }>;
    tips: string[];
    scripts: Array<{ vi: string; zh: string }>;
    knowledgeHits: Array<{ source: string; confidence: number; detail: string }>;
  };
  prompt?: { layers: Record<string, { label: string; content: string }>; model: { name: string; reason: string } } | null;
  proactiveWarnings?: Array<{ type: string; text: string }>;
  hasContext?: boolean;
  onCopy: (text: string) => void;
}

export default function RiskCard({ data, prompt, proactiveWarnings, hasContext, onCopy }: RiskCardProps) {
  const [footerOpen, setFooterOpen] = useState(false);

  const sortedFactors = [...data.factors].sort((a, b) => b.weight - a.weight);
  const maxWeight = Math.max(...data.factors.map((f) => f.weight), 1);

  return (
    <div className="rounded-2xl border border-[#EDEDED] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF8A00]" />
        <span className="text-xs font-medium text-[#666]">风险分析 · {data.context}</span>
      </div>

      <div className="px-4 pb-3 space-y-4">
        <RiskGauge score={data.score} />

        {/* Risk factors */}
        <div>
          <p className="text-xs font-semibold text-[#111] mb-2.5">风险因素</p>
          <div className="space-y-2">
            {sortedFactors.map((factor, index) => {
              const widthPercent = Math.round((factor.weight / maxWeight) * 100);
              let barColor: string;
              if (factor.weight >= 70) barColor = "bg-[#E53935]";
              else if (factor.weight >= 40) barColor = "bg-[#FF8A00]";
              else barColor = "bg-[#2E7D32]";
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${factor.active ? "font-medium text-[#111]" : "text-[#999]"}`}>{factor.label}</span>
                    <span className="text-[11px] text-[#999] tabular-nums">{factor.weight}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#F2F1EF]">
                    <div className={`h-full rounded-full transition-all duration-500 ${factor.active ? barColor : "bg-[#EDEDED]"}`} style={{ width: `${widthPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Situation */}
        <div className="rounded-lg bg-[#F2F1EF] p-3">
          <p className="text-xs font-semibold text-[#111] mb-1">情况说明</p>
          <p className="text-xs leading-relaxed text-[#666]">{data.situation}</p>
        </div>

        {/* Tips */}
        {data.tips.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#111] mb-2">注意事项</p>
            <ol className="space-y-1.5">
              {data.tips.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FF8A00]/10 text-[10px] font-bold text-[#FF8A00]">{index + 1}</span>
                  <p className="text-xs leading-relaxed text-[#666]">{tip}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Scripts */}
        {data.scripts.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#111] mb-2">实用话术</p>
            <div className="space-y-2">
              {data.scripts.map((script, index) => (
                <div key={index} className="rounded-lg border border-[#EDEDED] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#111] leading-relaxed">{script.vi}</p>
                      <p className="mt-1 text-xs text-[#999]">{script.zh}</p>
                    </div>
                    <button type="button" onClick={() => onCopy(script.vi)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F2F1EF] transition-colors hover:bg-[#EDEDED]" aria-label="复制话术">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <KBViewer hits={data.knowledgeHits} />

        {/* Footer */}
        {(prompt || proactiveWarnings || hasContext) && (
          <div>
            {footerOpen && (
              <div className="space-y-0">
                <PromptViewer prompt={prompt || null} />
                <ProactiveWarnings warnings={proactiveWarnings || null} />
                <ContextRef hasContext={!!hasContext} />
              </div>
            )}
            <button type="button" onClick={() => setFooterOpen(!footerOpen)} className="mt-2 flex w-full items-center justify-center gap-1 py-1.5 text-xs text-[#999] transition-colors hover:text-[#666]">
              <span>{footerOpen ? "收起详情" : "展开详情"}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${footerOpen ? "rotate-180" : ""}`}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
