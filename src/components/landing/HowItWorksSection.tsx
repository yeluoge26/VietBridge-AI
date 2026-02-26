import { UserPlus, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/shared/FadeIn";

const STEPS = [
  {
    icon: UserPlus,
    title: "注册账号",
    desc: "免费注册，30秒完成，即刻开始使用",
  },
  {
    icon: MessageCircle,
    title: "输入内容",
    desc: "粘贴或输入需要处理的内容，选择场景模式",
  },
  {
    icon: Sparkles,
    title: "获取AI结果",
    desc: "翻译、回复建议、风险分析一键完成",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-[#FAFAFA] py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <FadeIn>
          <Badge variant="secondary" className="mb-4">
            如何使用
          </Badge>
          <h2 className="mb-12 text-3xl font-bold text-[#111] md:text-4xl">
            三步开始，简单到不需要教程
          </h2>
        </FadeIn>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* Connector line (desktop only) */}
          <div className="pointer-events-none absolute left-1/6 right-1/6 top-8 hidden h-[2px] border-t-2 border-dashed border-[#DDD] md:block" />

          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 150}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#A855F7] shadow-lg">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#111] text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#111]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
