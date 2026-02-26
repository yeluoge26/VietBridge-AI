"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/shared/FadeIn";

const FAQS = [
  {
    q: "VietBridge AI 和 Google 翻译有什么区别？",
    a: "Google翻译是直译工具，VietBridge AI是沟通助手。我们不仅翻译文字，还理解语境、适配8种场景、解释文化差异，输出越南人真正能理解的自然表达。还提供回复建议、风险分析等Google没有的功能。",
  },
  {
    q: "免费版有什么限制？",
    a: "免费版每天50次使用额度，支持基础翻译和场景识别。升级Pro版可解锁GPT-4o模型、风险分析、文档扫描、AI回复建议等全部功能，每天999次额度。",
  },
  {
    q: "支持哪些场景？",
    a: "目前支持8种真实场景：通用、商务合作、员工管理、情侣沟通、餐厅点餐、租房、看病就医、维修服务。每种场景有专属的称谓、语气和文化规则，翻译结果更准确自然。",
  },
  {
    q: "数据安全吗？",
    a: "所有对话数据加密传输和存储，我们不会将你的内容用于训练模型。支持日志脱敏和审计追踪，你可以随时在个人中心删除历史记录。",
  },
  {
    q: "可以在手机上使用吗？",
    a: "VietBridge AI 是移动优先的Web应用，在手机浏览器中打开即可使用，无需下载APP。同时也完美适配电脑端，随时随地都能用。",
  },
  {
    q: "支持哪些支付方式？",
    a: "目前支持Stripe国际支付（信用卡/借记卡）。后续会增加微信支付和支付宝，满足更多华人用户的支付习惯。",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            常见问题
          </Badge>
          <h2 className="text-3xl font-bold text-[#111] md:text-4xl">
            还有疑问？
          </h2>
        </FadeIn>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div className="overflow-hidden rounded-xl border border-[#EDEDED] bg-white">
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === i ? null : i)
                  }
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[#FAFAFA]"
                >
                  <span className="pr-4 text-sm font-semibold text-[#111]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#999] transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    openIndex === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-[#666]">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
