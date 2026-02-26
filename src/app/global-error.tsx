"use client";

// ============================================================================
// VietBridge AI V2 — Global Error Boundary
// Catches unhandled errors at the root level
// ============================================================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif",
            backgroundColor: "#F8F7F5",
            padding: "24px",
          }}
        >
          <div
            style={{
              maxWidth: "380px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              {"😵"}
            </div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#111",
                marginBottom: "8px",
              }}
            >
              出错了
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#999",
                marginBottom: "24px",
                lineHeight: "1.5",
              }}
            >
              应用遇到了意外错误，请重试或刷新页面。
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#CCC",
                  marginBottom: "16px",
                }}
              >
                错误代码: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                backgroundColor: "#111",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
              }}
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
