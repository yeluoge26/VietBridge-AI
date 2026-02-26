import { useState, useEffect, useCallback } from "react";
import type { UsageData } from "@/api/usage";
import type { SubscriptionData } from "@/api/subscription";
import { apiGet } from "@/api/client";

const PLANS = [
  { id: "FREE", label: "\u514D\u8D39\u7248", price: "\u00A50", period: "", limit: "10\u6B21/\u5929", features: ["\u57FA\u7840\u7FFB\u8BD1", "\u573A\u666F\u8BC6\u522B", "\u6BCF\u65E5\u5B66\u4E60"], color: "#8B8B99", note: "\u6E38\u5BA2\u4E0D\u53EF\u4F7F\u7528\u62CD\u7167\u529F\u80FD" },
  { id: "PRO", label: "\u4E13\u4E1A\u7248", price: "\u00A549", period: "/\u6708", limit: "999\u6B21/\u5929", features: ["GPT-4o\u6A21\u578B", "\u98CE\u9669\u5206\u6790", "\u6587\u6863\u626B\u63CF", "\u4F18\u5148\u54CD\u5E94"], color: "#3B82F6", popular: true },
];

const APP_VERSION = "1.0.0";

export default function MePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [u, s] = await Promise.all([
        apiGet<UsageData>("/api/usage").catch(() => null),
        apiGet<SubscriptionData>("/api/subscription").catch(() => null),
      ]);
      if (u) setUsage(u);
      if (s) setSubscription(s);
    } catch { /* ignore */ }
    setDataLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currentPlan = subscription?.plan || usage?.plan || "FREE";

  return (
    <div className="flex flex-1 flex-col bg-[#F8F7F5]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-[#111]">{"\u4E2A\u4EBA\u4E2D\u5FC3"}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4">
        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {message.text}
          </div>
        )}

        {dataLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#EDEDED] border-t-[#111]" />
          </div>
        )}

        {!dataLoading && (
          <>
            {/* Guest info card */}
            <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#A855F7]/20 text-xl">
                  {"\uD83D\uDC4B"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111]">{"\u6E38\u5BA2\u7528\u6237"}</p>
                  <p className="text-xs text-[#999]">{"\u767B\u5F55\u540E\u89E3\u9501\u66F4\u591A\u529F\u80FD"}</p>
                </div>
                <span className="rounded-full bg-[#8B8B99]/10 px-2.5 py-1 text-[11px] font-semibold text-[#8B8B99]">
                  {PLANS.find((p) => p.id === currentPlan)?.label || "\u514D\u8D39\u7248"}
                </span>
              </div>
            </div>

            {/* Usage */}
            {usage && (
              <div className="rounded-2xl border border-[#EDEDED] bg-white p-4 space-y-3">
                <p className="text-sm font-bold text-[#111]">{"\u4ECA\u65E5\u7528\u91CF"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#999]">
                    {"\u5DF2\u4F7F\u7528"} {usage.used} / {usage.limit === -1 ? "\u65E0\u9650" : usage.limit} {"\u6B21"}
                  </span>
                  {usage.limit !== -1 && (
                    <span className="text-xs font-medium text-[#111]">{Math.round((usage.used / usage.limit) * 100)}%</span>
                  )}
                </div>
                {usage.limit !== -1 && (
                  <div className="h-2 overflow-hidden rounded-full bg-[#EDEDED]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((usage.used / usage.limit) * 100))}%`,
                        backgroundColor: usage.used / usage.limit > 0.8 ? "#EF4444" : usage.used / usage.limit > 0.5 ? "#FF8A00" : "#2E7D32",
                      }}
                    />
                  </div>
                )}
                {!usage.allowed && <p className="text-xs text-red-500">{"\u4ECA\u65E5\u989D\u5EA6\u5DF2\u7528\u5B8C"}</p>}
              </div>
            )}

            {/* Subscription info */}
            {subscription?.currentPeriodEnd && (
              <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
                <p className="text-sm font-bold text-[#111]">{"\u8BA2\u9605\u4FE1\u606F"}</p>
                <p className="text-xs text-[#999] mt-1">
                  {"\u5230\u671F\u65F6\u95F4\uFF1A"}{new Date(subscription.currentPeriodEnd).toLocaleDateString("zh-CN")}
                </p>
              </div>
            )}

            {/* Plan cards */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-[#111]">{"\u5957\u9910\u65B9\u6848"}</p>
              {PLANS.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                return (
                  <div key={plan.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: isCurrent ? plan.color + "60" : "#EDEDED" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: plan.color }}>{plan.label}</span>
                        {plan.popular && !isCurrent && <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3B82F6]">{"\u63A8\u8350"}</span>}
                        {isCurrent && <span className="rounded-full bg-[#2E7D32]/10 px-2 py-0.5 text-[10px] font-semibold text-[#2E7D32]">{"\u5F53\u524D"}</span>}
                      </div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-bold text-[#111]">{plan.price}</span>
                        {plan.period && <span className="text-xs text-[#999]">{plan.period}</span>}
                      </div>
                    </div>
                    <p className="text-xs text-[#999] mb-2">{plan.limit}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features.map((f) => <span key={f} className="rounded-md bg-[#F2F1EF] px-2 py-0.5 text-[11px] text-[#666]">{f}</span>)}
                    </div>
                    {"note" in plan && plan.note && (
                      <p className="mt-2 text-[11px] text-[#BBB]">{plan.note}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Settings & Info Section */}
            <div className="rounded-2xl border border-[#EDEDED] bg-white overflow-hidden">
              <button onClick={() => setShowPrivacy(!showPrivacy)} className="flex w-full items-center justify-between px-4 py-3.5 text-left border-b border-[#F2F1EF]">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B82F6]/10 text-sm">{"\uD83D\uDD12"}</span>
                  <span className="text-sm text-[#111]">{"\u9690\u79C1\u653F\u7B56"}</span>
                </div>
                <svg className={`transition-transform ${showPrivacy ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {showPrivacy && (
                <div className="px-4 py-3 text-xs text-[#666] leading-relaxed border-b border-[#F2F1EF] bg-[#FAFAFA]">
                  <p className="font-semibold text-[#111] mb-2">{"\u9690\u79C1\u653F\u7B56"}</p>
                  <p>{"\u66F4\u65B0\u65E5\u671F\uFF1A2026\u5E742\u670826\u65E5"}</p>
                  <p className="mt-2">VietBridge AI {"\u5C0A\u91CD\u60A8\u7684\u9690\u79C1\u3002\u6211\u4EEC\u6536\u96C6\u548C\u4F7F\u7528\u4EE5\u4E0B\u4FE1\u606F\uFF1A"}</p>
                  <p className="mt-1"><strong>{"\u6536\u96C6\u7684\u6570\u636E\uFF1A"}</strong>{"\u7FFB\u8BD1\u8BF7\u6C42\u5185\u5BB9\uFF08\u7528\u4E8EAI\u5904\u7406\uFF09\u3001\u4F7F\u7528\u7EDF\u8BA1\uFF08\u6BCF\u65E5\u8C03\u7528\u6B21\u6570\uFF09\u3001\u8BBE\u5907\u6807\u8BC6\uFF08\u533F\u540D\u6E38\u5BA2ID\uFF09\u3002"}</p>
                  <p className="mt-1"><strong>{"\u6570\u636E\u7528\u9014\uFF1A"}</strong>{"\u63D0\u4F9B\u7FFB\u8BD1\u3001\u5B66\u4E60\u3001\u98CE\u9669\u5206\u6790\u670D\u52A1\uFF1B\u6539\u8FDB\u4EA7\u54C1\u4F53\u9A8C\u3002"}</p>
                  <p className="mt-1"><strong>{"\u6570\u636E\u5B58\u50A8\uFF1A"}</strong>{"\u7FFB\u8BD1\u5185\u5BB9\u4E0D\u4F1A\u6C38\u4E45\u5B58\u50A8\uFF0C\u4EC5\u5728\u4F1A\u8BDD\u671F\u95F4\u4FDD\u7559\u3002\u4F7F\u7528\u7EDF\u8BA1\u533F\u540D\u5316\u540E\u4FDD\u5B5830\u5929\u3002"}</p>
                  <p className="mt-1"><strong>{"\u7B2C\u4E09\u65B9\u670D\u52A1\uFF1A"}</strong>{"\u6211\u4EEC\u4F7F\u7528 OpenAI \u548C DashScope \u63D0\u4F9B AI \u670D\u52A1\u3002\u60A8\u7684\u8F93\u5165\u5185\u5BB9\u4F1A\u53D1\u9001\u81F3\u8FD9\u4E9B\u670D\u52A1\u8FDB\u884C\u5904\u7406\u3002"}</p>
                  <p className="mt-1"><strong>{"\u60A8\u7684\u6743\u5229\uFF1A"}</strong>{"\u60A8\u53EF\u4EE5\u968F\u65F6\u505C\u6B62\u4F7F\u7528\u672C\u670D\u52A1\u3002\u5982\u9700\u5220\u9664\u6570\u636E\uFF0C\u8BF7\u8054\u7CFB support@vietbridge.ai\u3002"}</p>
                  <p className="mt-1"><strong>{"\u513F\u7AE5\u4FDD\u62A4\uFF1A"}</strong>{"\u672C\u670D\u52A1\u4E0D\u9762\u542113\u5C81\u4EE5\u4E0B\u7528\u6237\u3002"}</p>
                </div>
              )}

              <button onClick={() => setShowTerms(!showTerms)} className="flex w-full items-center justify-between px-4 py-3.5 text-left border-b border-[#F2F1EF]">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-sm">{"\uD83D\uDCC4"}</span>
                  <span className="text-sm text-[#111]">{"\u7528\u6237\u534F\u8BAE"}</span>
                </div>
                <svg className={`transition-transform ${showTerms ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {showTerms && (
                <div className="px-4 py-3 text-xs text-[#666] leading-relaxed border-b border-[#F2F1EF] bg-[#FAFAFA]">
                  <p className="font-semibold text-[#111] mb-2">{"\u7528\u6237\u670D\u52A1\u534F\u8BAE"}</p>
                  <p>{"\u66F4\u65B0\u65E5\u671F\uFF1A2026\u5E742\u670826\u65E5"}</p>
                  <p className="mt-2"><strong>{"\u670D\u52A1\u8BF4\u660E\uFF1A"}</strong>VietBridge AI {"\u662F\u4E00\u6B3E\u4E3A\u5728\u8D8A\u5357\u7684\u4E2D\u56FD\u7528\u6237\u63D0\u4F9B\u7684AI\u7FFB\u8BD1\u548C\u751F\u6D3B\u52A9\u624B\u5DE5\u5177\u3002"}</p>
                  <p className="mt-1"><strong>{"\u4F7F\u7528\u89C4\u8303\uFF1A"}</strong>{"\u7981\u6B62\u4F7F\u7528\u672C\u670D\u52A1\u8FDB\u884C\u8FDD\u6CD5\u6D3B\u52A8\u3001\u4F20\u64AD\u6709\u5BB3\u5185\u5BB9\u6216\u6EE5\u7528\u670D\u52A1\u3002"}</p>
                  <p className="mt-1"><strong>{"\u514D\u8D23\u58F0\u660E\uFF1A"}</strong>{"\u7FFB\u8BD1\u548C\u5EFA\u8BAE\u4EC5\u4F9BAI\u751F\u6210\u53C2\u8003\uFF0C\u4E0D\u6784\u6210\u4E13\u4E1A\u5EFA\u8BAE\u3002\u91CD\u8981\u51B3\u7B56\u8BF7\u54A8\u8BE2\u4E13\u4E1A\u4EBA\u58EB\u3002"}</p>
                  <p className="mt-1"><strong>{"\u77E5\u8BC6\u4EA7\u6743\uFF1A"}</strong>{"\u670D\u52A1\u7531 VietBridge AI \u56E2\u961F\u5F00\u53D1\u548C\u8FD0\u8425\u3002"}</p>
                  <p className="mt-1"><strong>{"\u670D\u52A1\u53D8\u66F4\uFF1A"}</strong>{"\u6211\u4EEC\u4FDD\u7559\u4FEE\u6539\u670D\u52A1\u5185\u5BB9\u548C\u4EF7\u683C\u7684\u6743\u5229\uFF0C\u4F1A\u63D0\u524D\u901A\u77E5\u7528\u6237\u3002"}</p>
                </div>
              )}

              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F2F1EF]">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/10 text-sm">{"\uD83D\uDCE7"}</span>
                  <span className="text-sm text-[#111]">{"\u95EE\u9898\u53CD\u9988"}</span>
                </div>
                <span className="text-xs text-[#999]">support@vietbridge.ai</span>
              </div>

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-sm">{"\u2139\uFE0F"}</span>
                  <span className="text-sm text-[#111]">{"\u5173\u4E8E"}</span>
                </div>
                <span className="text-xs text-[#999]">VietBridge AI v{APP_VERSION}</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-center text-[11px] text-[#BBB] pb-2">
              &copy; 2026 VietBridge AI. All rights reserved.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
