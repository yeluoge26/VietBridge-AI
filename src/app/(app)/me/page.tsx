"use client";

// ============================================================================
// VietBridge AI V2 — Profile / Me Page
// Show user email, sign out button
// ============================================================================

import { useSession, signOut } from "next-auth/react";

export default function MePage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#F8F7F5] p-8">
      <span className="text-4xl">👤</span>
      <h1 className="text-xl font-bold text-[#111]">个人中心</h1>

      {status === "loading" && (
        <p className="text-sm text-[#999]">加载中...</p>
      )}

      {status === "authenticated" && session?.user && (
        <div className="flex flex-col items-center gap-3">
          {session.user.name && (
            <p className="text-sm font-medium text-[#333]">
              {session.user.name}
            </p>
          )}
          <p className="text-sm text-[#666]">{session.user.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 rounded-lg border border-red-200 bg-white px-6 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            退出登录
          </button>
        </div>
      )}

      {status === "unauthenticated" && (
        <p className="text-sm text-[#999]">未登录</p>
      )}
    </div>
  );
}
