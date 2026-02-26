import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/shared/FadeIn";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <FadeIn>
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 text-xs font-medium"
          >
            AI驱动 · 专为在越华人打造
          </Badge>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-[#111] md:text-6xl md:leading-tight">
            在越南，
            <br className="md:hidden" />
            沟通不再是障碍
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-[#666] md:text-lg">
            VietBridge AI
            不是普通翻译工具——它理解语境、懂得文化、预警风险，
            <br className="hidden md:inline" />
            是你在越南生活的智能沟通伙伴。
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-52 bg-gradient-to-r from-[#3B82F6] to-[#A855F7] text-white shadow-lg hover:opacity-90"
              asChild
            >
              <Link href="/register">免费开始使用</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-52" asChild>
              <Link href="#features">了解功能</Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-sm text-[#999]">
            免费50次/天 · 无需信用卡 · 即开即用
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
