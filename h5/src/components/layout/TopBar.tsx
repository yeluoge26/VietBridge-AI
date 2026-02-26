interface TaskInfo {
  label: string;
  icon: string;
  color: string;
}

interface TopBarProps {
  currentTask: TaskInfo;
  onOpenTaskDrawer: () => void;
}

export default function TopBar({ currentTask, onOpenTaskDrawer }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-[#F8F7F5] px-4 py-3">
      <h1 className="text-lg font-bold tracking-tight text-[#111]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        VietBridge AI
      </h1>
      <button
        onClick={onOpenTaskDrawer}
        className="flex items-center gap-1.5 rounded-[10px] border border-[#EDEDED] bg-white px-3 py-1.5 transition-shadow hover:shadow-sm active:scale-[0.98]"
      >
        <span className="text-sm">{currentTask.icon}</span>
        <span className="text-sm font-medium" style={{ color: currentTask.color }}>
          {currentTask.label}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </header>
  );
}
