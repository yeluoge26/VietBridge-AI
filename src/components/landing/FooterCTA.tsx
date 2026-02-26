import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import FadeIn from "@/components/shared/FadeIn";

export default function FooterCTA() {
  return (
    <>
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#111] to-[#333] py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              开始你的智能沟通之旅
            </h2>
            <p className="mb-8 text-lg text-white/60">
              50次/天免费使用，无需信用卡
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="w-52 bg-gradient-to-r from-[#3B82F6] to-[#A855F7] text-white hover:opacity-90"
                asChild
              >
                <Link href="/register">免费注册</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-52 border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="#features">了解更多</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111] py-10 text-white/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white">
                VietBridge AI
              </span>
              <Separator
                orientation="vertical"
                className="h-4 bg-white/20"
              />
              <span className="text-sm">AI中越沟通助手</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href="/login" className="transition-colors hover:text-white">
                登录
              </Link>
              <Link
                href="/register"
                className="transition-colors hover:text-white"
              >
                注册
              </Link>
              <span className="cursor-default">隐私政策</span>
              <span className="cursor-default">服务条款</span>
            </div>

            <p className="text-xs">
              &copy; {new Date().getFullYear()} VietBridge AI. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
