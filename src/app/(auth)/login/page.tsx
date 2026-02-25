"use client";

// ============================================================================
// VietBridge AI V2 — Login Page (Chinese UI)
// Credentials + Google OAuth
// ============================================================================

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch {
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        {/* Title */}
        <h1 className="mb-6 text-center text-2xl font-bold text-[#111]">
          登录 VietBridge AI
        </h1>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
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

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[#333]"
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-[#DDD] px-4 py-2.5 text-sm text-[#111] outline-none transition-colors focus:border-[#111] focus:ring-1 focus:ring-[#111]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-[#111] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#EDEDED]" />
          <span className="text-xs text-[#AAA]">或</span>
          <div className="h-px flex-1 bg-[#EDEDED]" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#DDD] bg-white py-2.5 text-sm font-medium text-[#333] transition-colors hover:bg-[#F9F9F9]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          使用 Google 登录
        </button>

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-[#888]">
          没有账号？
          <Link
            href="/register"
            className="ml-1 font-medium text-[#111] hover:underline"
          >
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
