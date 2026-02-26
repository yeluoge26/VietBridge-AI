import {
  MessageSquareOff,
  AlertTriangle,
  MessagesSquare,
  FileQuestion,
  GraduationCap,
  MapPinOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/shared/FadeIn";

const PAIN_POINTS = [
  {
    icon: MessageSquareOff,
    title: "翻译生硬",
    desc: "Google翻译直译越南语，对方完全听不懂，沟通反而更困难",
  },
  {
    icon: AlertTriangle,
    title: "被坑风险",
    desc: "不知道报价是否合理，租房合同看不懂关键条款，总是吃哑巴亏",
  },
  {
    icon: MessagesSquare,
    title: "回复困难",
    desc: "收到越南语消息不知道怎么回，错过最佳沟通时机",
  },
  {
    icon: FileQuestion,
    title: "文件看不懂",
    desc: "菜单、收据、合同上的越南语，拍了照也翻译不出准确意思",
  },
  {
    icon: GraduationCap,
    title: "学不会越语",
    desc: "教材不实用，学的和实际生活中用的完全不一样",
  },
  {
    icon: MapPinOff,
    title: "缺少本地情报",
    desc: "不了解当地行情和消费水平，总是被当外地人宰",
  },
];

export default function PainPointsSection() {
  return (
    <section className="bg-[#FAFAFA] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            为什么需要 VietBridge AI
          </Badge>
          <h2 className="text-3xl font-bold text-[#111] md:text-4xl">
            在越南生活，你是否也有这些困扰？
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((item, i) => (
            <FadeIn key={item.title} delay={i * 80}>
              <div className="flex items-start gap-4 rounded-xl border border-[#EDEDED] bg-white p-6 transition-shadow hover:shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <item.icon className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#111]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#666]">
                    {item.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
