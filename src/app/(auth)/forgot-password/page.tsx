"use client";

// ============================================================================
// VietBridge AI V2 — Forgot Password Page
// POST to /api/auth/forgot-password, shows confirmation
// ============================================================================

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "操作失败");
        return;
      }

      setSent(true);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-[#111]">
          忘记密码
        </h1>
        <p className="mb-6 text-center text-sm text-[#888]">
          输入注册邮箱，我们将发送重置链接
        </p>

        {sent ? (
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
              邮件已发送
            </p>
            <p className="mb-6 text-sm text-[#888]">
              如果该邮箱已注册，您将收到一封重置密码的邮件。请检查收件箱（包括垃圾邮件）。
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-[#111] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
            >
              返回登录
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#333]"
                >
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-[#DDD] px-4 py-2.5 text-sm text-[#111] outline-none transition-colors focus:border-[#111] focus:ring-1 focus:ring-[#111]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-[#111] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "发送中..." : "发送重置链接"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#888]">
              想起密码了？
              <Link
                href="/login"
                className="ml-1 font-medium text-[#111] hover:underline"
              >
                返回登录
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
