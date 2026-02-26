interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 bg-[#111114] border border-[#27272F] rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
            active === tab.id
              ? "bg-[#18181C] text-[#EAEAEF] shadow-sm border border-[#27272F]"
              : "text-[#8B8B99] hover:text-[#EAEAEF] border border-transparent"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
