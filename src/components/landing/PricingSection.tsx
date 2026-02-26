import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FadeIn from "@/components/shared/FadeIn";

const PLANS = [
  {
    id: "FREE",
    label: "免费版",
    price: "¥0",
    period: "",
    limit: "10次/天",
    color: "#8B8B99",
    features: [
      "基础翻译",
      "场景识别",
      "每日学习",
      "中越双向翻译",
    ],
    cta: "免费开始",
    ctaVariant: "outline" as const,
    href: "/app",
  },
  {
    id: "PRO",
    label: "专业版",
    price: "¥49",
    period: "/月",
    limit: "999次/天",
    color: "#3B82F6",
    popular: true,
    features: [
      "GPT-4o 高精度模型",
      "风险分析与防骗建议",
      "文档扫描分析",
      "AI回复建议",
      "优先响应速度",
      "全部场景学习",
    ],
    cta: "立即升级",
    ctaVariant: "default" as const,
    href: "/register",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            价格方案
          </Badge>
          <h2 className="mb-3 text-3xl font-bold text-[#111] md:text-4xl">
            选择适合你的方案
          </h2>
          <p className="text-[#666]">所有方案均可免费开始，随时升级</p>
        </FadeIn>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.id} delay={i * 100}>
              <Card
                className={`relative flex h-full flex-col rounded-xl ${
                  plan.popular
                    ? "border-2 border-[#3B82F6] shadow-md"
                    : "border-[#EDEDED]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#3B82F6] to-[#A855F7] px-3 text-white">
                      最受欢迎
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle
                    className="text-lg"
                    style={{ color: plan.color }}
                  >
                    {plan.label}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#111]">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-[#999]">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <CardDescription>{plan.limit}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <Separator className="mb-5" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5"
                      >
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-sm text-[#666]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#3B82F6] to-[#A855F7] text-white hover:opacity-90"
                        : ""
                    }`}
                    variant={plan.ctaVariant}
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
