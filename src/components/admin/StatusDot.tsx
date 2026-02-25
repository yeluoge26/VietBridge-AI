"use client";

interface StatusDotProps {
  status: "ok" | "warn" | "alert";
}

const colorMap: Record<string, string> = {
  ok: "#22C55E",
  warn: "#F59E0B",
  alert: "#EF4444",
};

export default function StatusDot({ status }: StatusDotProps) {
  const c = colorMap[status] || colorMap.ok;
  return (
    <span className="relative inline-flex items-center justify-center w-2.5 h-2.5 flex-shrink-0">
      <span
        className="absolute inset-0 rounded-full opacity-30 animate-ping"
        style={{ backgroundColor: c }}
      />
      <span
        className="relative w-2 h-2 rounded-full"
        style={{ backgroundColor: c }}
      />
    </span>
  );
}
