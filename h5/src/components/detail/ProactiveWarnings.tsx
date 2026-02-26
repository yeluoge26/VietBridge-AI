interface ProactiveWarningsProps {
  warnings: Array<{ type: string; text: string }> | null;
}

const warningConfig: Record<string, { icon: string; bgClass: string; textClass: string; borderClass: string }> = {
  price: { icon: "\uD83D\uDCB0", bgClass: "bg-[#FF8A00]/8", textClass: "text-[#FF8A00]", borderClass: "border-[#FF8A00]/15" },
  tone: { icon: "\uD83D\uDDE3\uFE0F", bgClass: "bg-[#E91E63]/8", textClass: "text-[#E91E63]", borderClass: "border-[#E91E63]/15" },
  tip: { icon: "\uD83D\uDCA1", bgClass: "bg-[#1565C0]/8", textClass: "text-[#1565C0]", borderClass: "border-[#1565C0]/15" },
  risk: { icon: "\u26A0\uFE0F", bgClass: "bg-[#E53935]/8", textClass: "text-[#E53935]", borderClass: "border-[#E53935]/15" },
};

const defaultConfig = { icon: "\uD83D\uDCA1", bgClass: "bg-[#666]/8", textClass: "text-[#666]", borderClass: "border-[#666]/15" };

export default function ProactiveWarnings({ warnings }: ProactiveWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {warnings.map((warning, index) => {
        const config = warningConfig[warning.type] || defaultConfig;
        return (
          <div key={index} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${config.bgClass} ${config.borderClass}`}>
            <span className="mt-0.5 text-sm shrink-0">{config.icon}</span>
            <p className={`text-xs leading-relaxed ${config.textClass}`}>
              <span className="font-semibold">主动提醒：</span>{warning.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
