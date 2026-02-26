import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/shared/FadeIn";

export default function DemoSection() {
  return (
    <section className="bg-[#FAFAFA] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            产品界面
          </Badge>
          <h2 className="text-3xl font-bold text-[#111] md:text-4xl">
            精心设计的交互体验
          </h2>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="flex justify-center">
            {/* Phone frame */}
            <div className="w-[300px] overflow-hidden rounded-[2.5rem] border-[8px] border-[#111] bg-white shadow-2xl md:w-[340px]">
              {/* Status bar */}
              <div className="flex items-center justify-between bg-[#111] px-6 py-2">
                <span className="text-xs text-white/60">9:41</span>
                <div className="flex gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
                </div>
              </div>

              {/* App header */}
              <div className="border-b border-[#EDEDED] bg-white px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#111]">
                    VietBridge AI
                  </span>
                  <span className="rounded-full bg-[#FAFAFA] px-2.5 py-0.5 text-xs text-[#666]">
                    智能翻译
                  </span>
                </div>
                {/* Scene chips */}
                <div className="mt-2 flex gap-1.5 overflow-hidden">
                  {["通用", "商务", "员工", "情侣"].map((s, i) => (
                    <span
                      key={s}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
                        i === 0
                          ? "bg-[#111] text-white"
                          : "bg-[#F5F5F5] text-[#666]"
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chat area */}
              <div className="min-h-[320px] space-y-3 bg-[#F8F7F5] p-4">
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[#111] px-4 py-2.5 text-sm text-white">
                    明天我给你说
                  </div>
                </div>

                {/* AI bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] space-y-2 rounded-2xl rounded-bl-md border border-[#EDEDED] bg-white px-4 py-3">
                    <p className="text-xs font-medium text-[#3B82F6]">
                      翻译结果
                    </p>
                    <p className="text-sm text-[#111]">
                      Ngày mai tôi sẽ nói với bạn.
                    </p>
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-2.5">
                      <p className="text-xs font-medium text-[#A855F7]">
                        更自然表达
                      </p>
                      <p className="text-sm text-[#111]">
                        Mai em báo lại anh nhé.
                      </p>
                    </div>
                    <p className="text-xs leading-relaxed text-[#999]">
                      💡 第二句更适合口语，体现礼貌和亲近感
                    </p>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="border-t border-[#EDEDED] bg-white px-4 py-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#F5F5F5] px-4 py-2.5">
                  <span className="flex-1 text-sm text-[#999]">
                    输入中文或越南语...
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111]">
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom nav */}
              <div className="flex items-center justify-around border-t border-[#EDEDED] bg-white px-2 pb-4 pt-2">
                {[
                  { label: "首页", active: true },
                  { label: "扫描", active: false },
                  { label: "学习", active: false },
                  { label: "我的", active: false },
                ].map((tab) => (
                  <div
                    key={tab.label}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <div
                      className={`h-5 w-5 rounded-md ${
                        tab.active ? "bg-[#111]" : "bg-[#DDD]"
                      }`}
                    />
                    <span
                      className={`text-[10px] ${
                        tab.active
                          ? "font-semibold text-[#111]"
                          : "text-[#999]"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
