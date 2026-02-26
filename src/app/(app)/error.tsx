"use client";

// ============================================================================
// VietBridge AI V2 — App Error Boundary
// Handles errors within the (app) route group
// ============================================================================

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#F8F7F5] px-6">
      <div className="max-w-[320px] text-center">
        <div className="mb-4 text-4xl">{"⚠️"}</div>
        <h2 className="mb-2 text-base font-bold text-[#111]">
          页面出错了
        </h2>
        <p className="mb-1 text-xs text-[#999] leading-relaxed">
          {error.message || "加载失败，请重试。"}
        </p>
        {error.digest && (
          <p className="mb-4 text-[11px] text-[#CCC]">
            {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-3 w-full rounded-xl bg-[#111] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
        >
          重试
        </button>
      </div>
    </div>
  );
}
