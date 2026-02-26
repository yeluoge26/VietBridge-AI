import Link from "next/link";

// ============================================================================
// VietBridge AI V2 — 404 Not Found Page
// ============================================================================

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F7F5] px-6">
      <div className="max-w-[380px] text-center">
        <div className="mb-4 text-6xl font-bold text-[#EDEDED]">404</div>
        <h1 className="mb-2 text-lg font-bold text-[#111]">
          页面未找到
        </h1>
        <p className="mb-6 text-sm text-[#999] leading-relaxed">
          你访问的页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#111] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
