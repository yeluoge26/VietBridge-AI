"use client";

// ============================================================================
// VietBridge AI V2 — Admin Error Boundary
// Handles errors within the admin route group
// ============================================================================

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#09090B] px-6">
      <div className="max-w-[380px] text-center">
        <div className="mb-4 text-4xl">{"🔧"}</div>
        <h2 className="mb-2 text-base font-bold text-white">
          管理后台出错
        </h2>
        <p className="mb-1 text-xs text-[#888] leading-relaxed">
          {error.message || "加载失败，请重试。"}
        </p>
        {error.digest && (
          <p className="mb-4 text-[11px] text-[#555]">
            错误代码: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-3 w-full rounded-xl bg-white py-3 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E4E4E7]"
        >
          重试
        </button>
      </div>
    </div>
  );
}
