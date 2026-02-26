"use client";

import {
  Languages,
  MessageSquare,
  ScanLine,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import FadeIn from "@/components/shared/FadeIn";
import type { LucideIcon } from "lucide-react";

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  demo: { label: string; input: string; output: string };
}

const FEATURES: Feature[] = [
  {
    id: "translate",
    icon: Languages,
    title: "智能翻译",
    subtitle: "不只是翻译，更是沟通",
    description:
      "理解上下文语境，输出越南人真正听得懂的表达。支持8种场景模式，自动匹配最合适的称谓和语气词。",
    highlights: ["语境感知翻译", "8种场景模式", "自然地道表达", "中越双向"],
    demo: {
      label: "翻译示例",
      input: "明天我给你说",
      output: 'Mai em báo lại anh nhé.\n更自然的口语表达，适合商务沟通场景',
    },
  },
  {
    id: "reply",
    icon: MessageSquare,
    title: "AI回复建议",
    subtitle: "一键生成3种风格回复",
    description:
      "收到越南语消息不知如何回复？粘贴进来，AI为你分析对方情绪和意图，生成正式、友好、简洁三种回复建议。",
    highlights: ["3种语气风格", "场景自适应", "一键复制发送", "文化得体"],
    demo: {
      label: "回复示例",
      input: "Hôm nay nhân viên không đến làm.",
      output: '对方在说：今天有员工没来上班\n\n礼貌回复：Cảm ơn anh đã báo...\n直接回复：Vậy anh gọi...',
    },
  },
  {
    id: "scan",
    icon: ScanLine,
    title: "文档扫描",
    subtitle: "拍照即翻，智能分析",
    description:
      "对着菜单、收据、合同拍照上传，AI不仅翻译文字，还会分析价格合理性、隐藏收费和关键条款风险。",
    highlights: ["OCR识别", "智能分析", "价格参考", "关键提醒"],
    demo: {
      label: "扫描示例",
      input: "📸 拍照识别菜单",
      output: 'Cá bò hòm → 箱鱼（牛角鱼/烤鱼）\n本地均价：150-200K VND\n⚠️ 此价格偏高',
    },
  },
  {
    id: "risk",
    icon: ShieldAlert,
    title: "风险分析",
    subtitle: "AI帮你识别防骗预警",
    description:
      "描述你遇到的场景或交易，AI评估风险等级、识别常见套路，结合岘港本地情报库提供防坑建议和应对话术。",
    highlights: ["风险评分", "常见套路库", "本地情报", "应对话术"],
    demo: {
      label: "风险示例",
      input: "中介让我交3个月押金",
      output: '风险分数：75/100 ⚠️\n越南标准押金为1-2个月\n建议：要求提供正式收据...',
    },
  },
  {
    id: "learn",
    icon: BookOpen,
    title: "越南语教学",
    subtitle: "实战场景，学了就能用",
    description:
      "不背单词、不学语法。基于8种真实生活场景教你最实用的越南语表达，配合发音练习和文化解释。",
    highlights: ["场景化教学", "发音练习", "每日一句", "实用优先"],
    demo: {
      label: "教学示例",
      input: '学习："多少钱？"',
      output: 'Bao nhiêu tiền?\n[bao nyew tien]\n\n文化提示：在市场可以用 "Giảm giá đi" 来还价',
    },
  },
];

function FeatureDemo({ demo }: { demo: Feature["demo"] }) {
  return (
    <div className="rounded-xl border border-[#EDEDED] bg-[#FAFAFA] p-5">
      <div className="mb-3 text-xs font-medium text-[#999]">{demo.label}</div>
      <div className="mb-3 rounded-lg bg-white p-3 text-sm text-[#111]">
        <span className="text-xs text-[#999]">输入：</span>
        <br />
        {demo.input}
      </div>
      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-3 text-sm text-[#111]">
        <span className="text-xs text-[#999]">AI输出：</span>
        <br />
        <span className="whitespace-pre-line">{demo.output}</span>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            核心功能
          </Badge>
          <h2 className="text-3xl font-bold text-[#111] md:text-4xl">
            五大AI能力，覆盖在越生活全场景
          </h2>
        </FadeIn>

        {/* Desktop: Tabs */}
        <div className="hidden md:block">
          <Tabs defaultValue="translate">
            <TabsList className="mb-8 flex w-full justify-center gap-1 bg-transparent">
              {FEATURES.map((f) => (
                <TabsTrigger
                  key={f.id}
                  value={f.id}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm data-[state=active]:bg-[#111] data-[state=active]:text-white"
                >
                  <f.icon className="h-4 w-4" />
                  {f.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {FEATURES.map((f) => (
              <TabsContent key={f.id} value={f.id}>
                <div className="grid items-center gap-10 md:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#A855F7]">
                        <f.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#111]">
                          {f.title}
                        </h3>
                        <p className="text-sm text-[#999]">{f.subtitle}</p>
                      </div>
                    </div>
                    <p className="mb-5 mt-4 leading-relaxed text-[#666]">
                      {f.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {f.highlights.map((h) => (
                        <Badge
                          key={h}
                          variant="secondary"
                          className="text-xs"
                        >
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FeatureDemo demo={f.demo} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Mobile: Stacked cards */}
        <div className="space-y-5 md:hidden">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.id} delay={i * 80}>
              <Card className="border-[#EDEDED]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#A855F7]">
                      <f.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{f.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {f.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm leading-relaxed text-[#666]">
                    {f.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {f.highlights.map((h) => (
                      <Badge
                        key={h}
                        variant="secondary"
                        className="text-xs"
                      >
                        {h}
                      </Badge>
                    ))}
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
