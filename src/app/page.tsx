// ============================================================================
// VietBridge AI V2 — Landing Page
// Hero section + 4 feature cards + CTA buttons
// ============================================================================

import Link from "next/link";

const features = [
  {
    icon: "🌐",
    title: "智能翻译",
    description: "中越双语智能翻译，支持语境理解和专业术语",
  },
  {
    icon: "💬",
    title: "AI回复",
    description: "根据场景生成多风格回复建议，轻松应对沟通",
  },
  {
    icon: "🛡️",
    title: "风险分析",
    description: "智能识别沟通中的潜在风险，避免踩坑",
  },
  {
    icon: "📖",
    title: "越语教学",
    description: "实战场景越南语学习，快速提升沟通能力",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1
          className="mb-3 text-4xl font-bold tracking-tight text-[#111]"
          style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}
        >
          VietBridge AI
        </h1>
        <p className="text-lg text-[#666]">在越南的智能沟通助手</p>
      </div>

      {/* Feature Cards */}
      <div className="mb-12 grid w-full max-w-md grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-start gap-2 rounded-2xl border border-[#EDEDED] bg-[#FAFAFA] p-5 transition-shadow hover:shadow-md"
          >
            <span className="text-2xl">{feature.icon}</span>
            <h3 className="text-sm font-semibold text-[#111]">
              {feature.title}
            </h3>
            <p className="text-xs leading-relaxed text-[#888]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/login"
          className="flex h-12 w-48 items-center justify-center rounded-full bg-[#111] text-sm font-semibold text-white transition-colors hover:bg-[#333]"
        >
          开始使用
        </Link>
        <Link
          href="/admin"
          className="flex h-12 w-48 items-center justify-center rounded-full border border-[#DDD] bg-white text-sm font-semibold text-[#111] transition-colors hover:bg-[#F5F5F5]"
        >
          管理后台
        </Link>
      </div>
    </div>
  );
}
