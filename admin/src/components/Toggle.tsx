interface ToggleProps {
  on: boolean;
  onToggle: () => void;
}

export default function Toggle({ on, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
        on ? "bg-[#3B82F6]" : "bg-[#27272F]"
      }`}
      aria-checked={on}
      role="switch"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
