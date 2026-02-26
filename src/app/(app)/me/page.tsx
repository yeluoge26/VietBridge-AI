"use client";

// ============================================================================
// VietBridge AI V2 — Profile / Me Page
// User info, subscription, usage stats, plan upgrade
// Supports both authenticated users and guests
// ============================================================================

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClientGuestId } from "@/hooks/useGuestId";

interface UsageData {
  used: number;
  limit: number;
  allowed: boolean;
  plan: string;
}

interface SubscriptionData {
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

const PLANS = [
  {
    id: "FREE",
    label: "免费版",
    price: "¥0",
    period: "",
    limit: "10次/天",
    features: ["基础翻译", "场景识别", "每日学习"],
    color: "#8B8B99",
  },
  {
    id: "PRO",
    label: "专业版",
    price: "¥49",
    period: "/月",
    limit: "999次/天",
    features: ["GPT-4o模型", "风险分析", "文档扫描", "优先响应"],
    color: "#3B82F6",
    priceIdEnv: "STRIPE_PRO_PRICE_ID",
    popular: true,
  },
];

function guestHeaders(): HeadersInit {
  const guestId = getClientGuestId();
  return guestId ? { "X-Guest-Id": guestId } : {};
}

function MePageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check for Stripe callback params
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({ type: "success", text: "订阅成功！欢迎使用专业版。" });
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "error", text: "订阅已取消。" });
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      const headers = guestHeaders();
      const [usageRes, subRes] = await Promise.all([
        fetch("/api/usage", { headers }),
        fetch("/api/subscription", { headers }),
      ]);
      if (usageRes.ok) setUsage(await usageRes.json());
      if (subRes.ok) setSubscription(await subRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
    else if (status === "unauthenticated") fetchData();
  }, [status, fetchData]);

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error || "升级失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setMessage({ type: "error", text: "无法打开订阅管理" });
    }
  };

  const isAuthenticated = status === "authenticated" && session?.user;
  const isGuest = status === "unauthenticated";
  const currentPlan = isGuest ? "FREE" : (subscription?.plan || usage?.plan || "FREE");

  // ── Shared usage stats component ──────────────────────────────────────
  const UsageStats = () =>
    usage ? (
      <div className="rounded-2xl border border-[#EDEDED] bg-white p-4 space-y-3">
        <p className="text-sm font-bold text-[#111]">今日用量</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#999]">
            已使用 {usage.used} / {usage.limit === -1 ? "无限" : usage.limit} 次
          </span>
          {usage.limit !== -1 && (
            <span className="text-xs font-medium text-[#111]">
              {Math.round((usage.used / usage.limit) * 100)}%
            </span>
          )}
        </div>
        {usage.limit !== -1 && (
          <div className="h-2 overflow-hidden rounded-full bg-[#EDEDED]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((usage.used / usage.limit) * 100))}%`,
                backgroundColor:
                  usage.used / usage.limit > 0.8
                    ? "#EF4444"
                    : usage.used / usage.limit > 0.5
                    ? "#FF8A00"
                    : "#2E7D32",
              }}
            />
          </div>
        )}
        {!usage.allowed && (
          <p className="text-xs text-red-500">
            今日额度已用完{isGuest ? "，注册后可获得更多额度" : "，升级后可获得更多额度"}
          </p>
        )}
      </div>
    ) : null;

  // ── Shared plan cards component ───────────────────────────────────────
  const PlanCards = () => (
    <div className="space-y-3">
      <p className="text-sm font-bold text-[#111]">套餐方案</p>
      {PLANS.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        return (
          <div
            key={plan.id}
            className="rounded-2xl border bg-white p-4"
            style={{
              borderColor: isCurrent ? plan.color + "60" : "#EDEDED",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-bold"
                  style={{ color: plan.color }}
                >
                  {plan.label}
                </span>
                {plan.popular && !isCurrent && (
                  <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3B82F6]">
                    推荐
                  </span>
                )}
                {isCurrent && (
                  <span className="rounded-full bg-[#2E7D32]/10 px-2 py-0.5 text-[10px] font-semibold text-[#2E7D32]">
                    当前{isGuest ? " (游客)" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-bold text-[#111]">{plan.price}</span>
                {plan.period && (
                  <span className="text-xs text-[#999]">{plan.period}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-[#999] mb-2">{plan.limit}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {plan.features.map((f) => (
                <span
                  key={f}
                  className="rounded-md bg-[#F2F1EF] px-2 py-0.5 text-[11px] text-[#666]"
                >
                  {f}
                </span>
              ))}
            </div>
            {!isCurrent && plan.id !== "FREE" && (
              isGuest ? (
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: plan.color }}
                >
                  注册后升级
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: plan.color }}
                >
                  {upgrading ? "处理中..." : "升级"}
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-1 flex-col bg-[#F8F7F5]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-[#111]">个人中心</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4">
        {/* Status messages */}
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#EDEDED] border-t-[#111]" />
          </div>
        )}

        {/* ── Authenticated user ─────────────────────────────────────── */}
        {isAuthenticated && (
          <>
            {/* User info card */}
            <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F1EF] text-xl">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {session.user.name && (
                    <p className="text-sm font-bold text-[#111]">{session.user.name}</p>
                  )}
                  <p className="text-xs text-[#999] truncate">{session.user.email}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    color: PLANS.find((p) => p.id === currentPlan)?.color || "#8B8B99",
                    backgroundColor:
                      (PLANS.find((p) => p.id === currentPlan)?.color || "#8B8B99") + "20",
                  }}
                >
                  {PLANS.find((p) => p.id === currentPlan)?.label || "免费版"}
                </span>
              </div>
            </div>

            <UsageStats />

            {/* Subscription period */}
            {subscription?.currentPeriodEnd && (
              <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#111]">订阅信息</p>
                    <p className="text-xs text-[#999] mt-1">
                      到期时间：{new Date(subscription.currentPeriodEnd).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    className="rounded-lg border border-[#DDD] bg-white px-3 py-1.5 text-xs font-medium text-[#111] transition-colors hover:bg-[#F8F7F5]"
                  >
                    管理订阅
                  </button>
                </div>
              </div>
            )}

            <PlanCards />

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center justify-center rounded-xl border border-red-200 bg-white py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              退出登录
            </button>
          </>
        )}

        {/* ── Guest user ─────────────────────────────────────────────── */}
        {isGuest && (
          <>
            {/* Guest info card */}
            <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6]/20 to-[#A855F7]/20 text-xl">
                  👋
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111]">游客用户</p>
                  <p className="text-xs text-[#999]">登录后可保存对话记录</p>
                </div>
                <span className="rounded-full bg-[#8B8B99]/10 px-2.5 py-1 text-[11px] font-semibold text-[#8B8B99]">
                  免费版
                </span>
              </div>
            </div>

            <UsageStats />

            {/* Login/Register prompt */}
            <div className="rounded-2xl border border-[#3B82F6]/30 bg-blue-50/50 p-4 space-y-3">
              <p className="text-sm font-bold text-[#111]">登录解锁更多</p>
              <p className="text-xs text-[#666] leading-relaxed">
                登录后可保存对话记录、升级到专业版获取 GPT-4o 高精度模型和更多功能。
              </p>
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-xl bg-[#111] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#333]"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-xl border border-[#DDD] bg-white py-2.5 text-center text-sm font-semibold text-[#111] transition-colors hover:bg-[#F8F7F5]"
                >
                  注册
                </Link>
              </div>
            </div>

            <PlanCards />
          </>
        )}
      </div>
    </div>
  );
}

export default function MePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-[#F8F7F5]">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#EDEDED] border-t-[#111]" />
        </div>
      }
    >
      <MePageContent />
    </Suspense>
  );
}
