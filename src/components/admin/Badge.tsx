"use client";

interface BadgeProps {
  text: string;
  color?: string;
  bg?: string;
}

export default function Badge({
  text,
  color = "#EAEAEF",
  bg = "#27272F",
}: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight whitespace-nowrap"
      style={{ color, backgroundColor: bg }}
    >
      {text}
    </span>
  );
}
