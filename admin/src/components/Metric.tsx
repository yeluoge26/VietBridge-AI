interface MetricProps {
  label: string;
  value: string | number;
  delta?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

export default function Metric({
  label,
  value,
  delta,
  prefix,
  suffix,
  color,
}: MetricProps) {
  const isUp = delta !== undefined && delta >= 0;

  return (
    <div className="group bg-[#18181C] border border-[#27272F] rounded-xl px-4 py-3.5 hover:border-[#333340] hover:bg-[#1E1E24] transition-all duration-200 cursor-default">
      <div className="text-[10px] font-medium text-[#55556A] uppercase tracking-[0.1em] mb-2">
        {label}
      </div>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-0.5">
          {prefix && (
            <span
              className="text-[13px] font-medium"
              style={{ color: color || "#8B8B99" }}
            >
              {prefix}
            </span>
          )}
          <span
            className="text-[22px] font-bold leading-none"
            style={{ color: color || "#EAEAEF" }}
          >
            {value}
          </span>
          {suffix && (
            <span
              className="text-[13px] font-medium"
              style={{ color: color || "#8B8B99" }}
            >
              {suffix}
            </span>
          )}
        </div>
        {delta !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-[11px] font-medium ${
              isUp ? "text-[#4ADE80]" : "text-[#F87171]"
            }`}
          >
            <span>{isUp ? "\u2191" : "\u2193"}</span>
            <span>{Math.abs(delta)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
