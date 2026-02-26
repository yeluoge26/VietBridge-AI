interface SceneChipsProps {
  activeScene: string;
  onSceneChange: (scene: string) => void;
  visible: boolean;
}

const scenes = [
  { id: "general", icon: "\uD83D\uDCA1", label: "\u901A\u7528", color: "#111" },
  { id: "business", icon: "\uD83D\uDCBC", label: "\u5546\u52A1", color: "#2E7D32" },
  { id: "staff", icon: "\uD83D\uDC65", label: "\u5458\u5DE5\u7BA1\u7406", color: "#6A1B9A" },
  { id: "couple", icon: "\uD83D\uDC95", label: "\u60C5\u4FA3", color: "#D4697A" },
  { id: "restaurant", icon: "\uD83C\uDF7D\uFE0F", label: "\u9910\u5385", color: "#FF8A00" },
  { id: "rent", icon: "\uD83C\uDFE0", label: "\u79DF\u623F", color: "#1565C0" },
  { id: "hospital", icon: "\uD83C\uDFE5", label: "\u533B\u9662", color: "#E53935" },
  { id: "housekeeping", icon: "\uD83E\uDDF9", label: "\u5BB6\u653F", color: "#795548" },
];

export default function SceneChips({ activeScene, onSceneChange, visible }: SceneChipsProps) {
  if (!visible) return null;

  return (
    <div className="grid grid-cols-2 gap-2 px-4 py-2">
      {scenes.map((scene) => {
        const isActive = activeScene === scene.id;
        return (
          <button
            key={scene.id}
            onClick={() => onSceneChange(scene.id)}
            className={`flex items-center gap-1 rounded-[20px] border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.96] ${isActive ? "" : "border-[#EDEDED] bg-white text-[#666] hover:bg-[#F2F1EF]"}`}
            style={isActive ? { color: scene.color, borderColor: scene.color, backgroundColor: `${scene.color}12` } : undefined}
          >
            <span>{scene.icon}</span>
            <span>{scene.label}</span>
          </button>
        );
      })}
    </div>
  );
}
