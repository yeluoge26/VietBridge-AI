import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FadeIn from "@/components/shared/FadeIn";

const TESTIMONIALS = [
  {
    name: "张伟",
    role: "岘港餐饮老板",
    initials: "张",
    quote:
      "以前和越南员工沟通全靠比划，现在用VietBridge翻译出来的越南语，他们一下就懂了。场景模式特别好用，商务和日常完全不同的说法。",
  },
  {
    name: "李娜",
    role: "跨境电商创业者",
    initials: "李",
    quote:
      "最好用的是风险分析功能，帮我避开了两次合同陷阱。本地情报库的价格参考也很实用，再也不怕被宰了。",
  },
  {
    name: "王强",
    role: "自由职业者",
    initials: "王",
    quote:
      "回复建议太方便了，收到越南语消息不用再手忙脚乱。三种风格随便选，正式场合和朋友聊天都有合适的回复。",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#FAFAFA] py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            用户评价
          </Badge>
          <h2 className="text-3xl font-bold text-[#111] md:text-4xl">
            他们正在使用 VietBridge AI
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 100}>
              <Card className="h-full border-[#EDEDED] bg-white">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="mb-3 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-[#666]">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <Separator className="my-4" />

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] text-sm font-bold text-white">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111]">
                        {t.name}
                      </p>
                      <p className="text-xs text-[#999]">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
