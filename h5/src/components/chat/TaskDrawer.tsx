import { useEffect } from "react";

interface TaskDrawerProps {
  open: boolean;
  currentTask: string;
  onSelect: (task: string) => void;
  onClose: () => void;
}

const tasks = [
  { id: "translate", icon: "\uD83C\uDF10", label: "\u7FFB\u8BD1", description: "\u4E2D\u8D8A\u53CC\u8BED\u7FFB\u8BD1", color: "#111" },
  { id: "reply", icon: "\uD83D\uDCAC", label: "\u56DE\u590D\u5EFA\u8BAE", description: "AI\u591A\u98CE\u683C\u56DE\u590D", color: "#1565C0" },
  { id: "risk", icon: "\uD83D\uDEE1\uFE0F", label: "\u98CE\u9669\u5206\u6790", description: "\u9632\u8E29\u5751\u8BC4\u4F30", color: "#E53935" },
  { id: "learn", icon: "\uD83D\uDCD6", label: "\u6559\u6211\u8BF4", description: "\u5B9E\u6218\u8D8A\u5357\u8BED", color: "#2E7D32" },
];

export default function TaskDrawer({ open, currentTask, onSelect, onClose }: TaskDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#EDEDED]" />
        <h2 className="mb-4 text-base font-bold text-[#111]">选择任务</h2>
        <div className="grid grid-cols-2 gap-3">
          {tasks.map((task) => {
            const isActive = currentTask === task.id;
            return (
              <button
                key={task.id}
                onClick={() => onSelect(task.id)}
                className={`flex flex-col items-start gap-1 rounded-[14px] border-2 p-4 text-left transition-all active:scale-[0.97] ${isActive ? "bg-[#F8F7F5]" : "border-[#EDEDED] bg-white hover:bg-[#F8F7F5]"}`}
                style={isActive ? { borderColor: task.color } : undefined}
              >
                <span className="text-2xl">{task.icon}</span>
                <span className="text-sm font-semibold text-[#111]">{task.label}</span>
                <span className="text-xs text-[#999]">{task.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
