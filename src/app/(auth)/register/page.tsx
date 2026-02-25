"use client";

// ============================================================================
// VietBridge AI V2 — Register Page (Chinese UI)
// POST to /api/auth/register, then auto-login
// ============================================================================

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push("/login");
      } else {
        router.push("/");
      }
    } catch {
      setError("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        {/* Title */}
        <h1 className="mb-6 text-center text-2xl font-bold text-[#111]">
          注册 VietBridge AI
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
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-[#333]"
            >
              姓名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的名字"
              required
              className="w-full rounded-lg border border-[#DDD] px-4 py-2.5 text-sm text-[#111] outline-none transition-colors focus:border-[#111] focus:ring-1 focus:ring-[#111]"
            />
          </div>

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
              确认密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再输入一次密码"
              required
              className="w-full rounded-lg border border-[#DDD] px-4 py-2.5 text-sm text-[#111] outline-none transition-colors focus:border-[#111] focus:ring-1 focus:ring-[#111]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-[#111] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-[#888]">
          已有账号？
          <Link
            href="/login"
            className="ml-1 font-medium text-[#111] hover:underline"
          >
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
