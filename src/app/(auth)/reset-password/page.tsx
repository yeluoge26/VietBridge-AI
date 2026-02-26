"use client";

// ============================================================================
// VietBridge AI V2 — Reset Password Page
// Reads ?token= from URL, POST to /api/auth/reset-password
// ============================================================================

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm text-red-600">
          无效的重置链接，缺少令牌参数。
        </p>
        <Link
          href="/forgot-password"
          className="inline-block rounded-lg bg-[#111] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
        >
          重新申请
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少6个字符");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "重置失败");
        return;
      }

      setSuccess(true);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
        <p className="mb-2 text-sm font-medium text-[#111]">
          密码已重置
        </p>
        <p className="mb-6 text-sm text-[#888]">
          请使用新密码登录您的账号。
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-[#111] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-[#333]"
          >
            新密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少6个字符"
            required
            className="w-full rounded-lg border border-[#DDD] px-4 py-2.5 text-sm text-[#111] outline-none transition-colors focus:border-[#111] focus:ring-1 focus:ring-[#111]"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-[#333]"
          >
            确认新密码
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再输入一次新密码"
            required
            className="w-full rounded-lg border border-[#DDD] px-4 py-2.5 text-sm text-[#111] outline-none transition-colors focus:border-[#111] focus:ring-1 focus:ring-[#111]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-[#111] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "重置中..." : "重置密码"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-[#111]">
          重置密码
        </h1>
        <Suspense
          fallback={
            <div className="py-8 text-center text-sm text-[#888]">
              加载中...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
