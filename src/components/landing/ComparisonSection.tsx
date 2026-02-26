import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/shared/FadeIn";

const COMPARISONS = [
  {
    feature: "翻译质量",
    google: "直译，语法僵硬",
    vietbridge: "语境翻译，自然地道",
  },
  {
    feature: "回复建议",
    google: "无此功能",
    vietbridge: "3种风格一键生成",
  },
  {
    feature: "文化解释",
    google: "无",
    vietbridge: "自动补充文化背景",
  },
  {
    feature: "风险预警",
    google: "无",
    vietbridge: "AI评估 + 本地情报",
  },
  {
    feature: "场景适配",
    google: "统一输出",
    vietbridge: "8种场景智能切换",
  },
  {
    feature: "越南本地情报",
    google: "无",
    vietbridge: "岘港消费参考 / 防骗库",
  },
  {
    feature: "文档扫描分析",
    google: "仅OCR翻译",
    vietbridge: "OCR + 价格分析 + 条款提醒",
  },
  {
    feature: "越南语教学",
    google: "无",
    vietbridge: "实战场景化教学",
  },
];

export default function ComparisonSection() {
  return (
    <section id="comparison" className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <FadeIn className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            功能对比
          </Badge>
          <h2 className="text-3xl font-bold text-[#111] md:text-4xl">
            不是翻译工具的升级，而是全新品类
          </h2>
        </FadeIn>

        {/* Desktop Table */}
        <FadeIn>
          <div className="hidden overflow-hidden rounded-xl border border-[#EDEDED] md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#FAFAFA]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111]">
                    功能
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#999]">
                    Google 翻译
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#111]">
                    VietBridge AI
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-t border-[#EDEDED]"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#111]">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 shrink-0 text-red-400" />
                        <span className="text-sm text-[#999]">
                          {row.google}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-sm font-medium text-[#111]">
                          {row.vietbridge}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* Mobile: Stacked cards */}
        <div className="space-y-3 md:hidden">
          {COMPARISONS.map((row, i) => (
            <FadeIn key={row.feature} delay={i * 50}>
              <div className="rounded-xl border border-[#EDEDED] bg-white p-4">
                <p className="mb-3 text-sm font-semibold text-[#111]">
                  {row.feature}
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <div>
                      <span className="text-xs text-[#999]">
                        Google 翻译
                      </span>
                      <p className="text-sm text-[#999]">{row.google}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <div>
                      <span className="text-xs text-[#3B82F6]">
                        VietBridge AI
                      </span>
                      <p className="text-sm font-medium text-[#111]">
                        {row.vietbridge}
                      </p>
                    </div>
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
