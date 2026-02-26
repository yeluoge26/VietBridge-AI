import { useState } from "react";

/* ───────── Section types ───────── */
type SectionId = "price" | "safety" | "transport" | "dining" | "service" | "rent" | "medical";

interface GuideItem {
  title: string;
  content: string;
  severity?: "critical" | "high" | "medium" | "low";
}

interface GuideSection {
  id: SectionId;
  label: string;
  emoji: string;
  color: string;
  items: GuideItem[];
}

/* ───────── Static data (curated from knowledge_entries + risk_rules) ───────── */

const SECTIONS: GuideSection[] = [
  {
    id: "price",
    label: "物价参考",
    emoji: "💰",
    color: "#F59E0B",
    items: [
      { title: "法棍三明治 Bánh mì", content: "路边摊 15,000-25,000₫ · 游客区 25,000-40,000₫" },
      { title: "河粉 Phở", content: "路边摊 30,000-50,000₫ · 餐厅 60,000-100,000₫" },
      { title: "广南面 Mì Quảng", content: "本地 25,000-35,000₫ · 游客区 50,000-80,000₫" },
      { title: "越南咖啡 Cà phê", content: "路边 10,000-20,000₫ · 咖啡馆 25,000-50,000₫" },
      { title: "本地啤酒 Bia", content: "便利店 15,000-25,000₫ · 酒吧 30,000-50,000₫" },
      { title: "甘蔗汁 Nước mía", content: "路边 10,000-15,000₫" },
      { title: "越南煎饼 Bánh xèo", content: "路边 40,000-70,000₫" },
      { title: "椰子冻 Rau câu dừa", content: "路边 20,000-30,000₫" },
      { title: "海鲜大餐", content: "本地餐厅人均 300,000-500,000₫ · 游客区 700,000₫+" },
      { title: "瓶装水 1.5L", content: "超市 10,000-15,000₫（路边/景区更贵）" },
      { title: "方便面 Mì ăn liền", content: "超市 3,500-5,000₫/包" },
      { title: "水果 Trái cây", content: "火龙果 20,000-30,000₫/kg · 芒果 25,000-40,000₫/kg" },
    ],
  },
  {
    id: "safety",
    label: "安全防骗",
    emoji: "🛡️",
    color: "#EF4444",
    items: [
      { title: "出租车绕路宰客", content: "优先用 Grab 叫车，上车前确认路线和大概费用。传统出租车选择 Mai Linh、Vinasun 等正规公司。", severity: "high" },
      { title: "假币风险", content: "现金交易注意辨认真伪，特别是夜市、街边摊找零时。大额钱币注意触感和水印。", severity: "high" },
      { title: "ATM 取款安全", content: "使用银行内部 ATM，避免街边无监控机器。取款时遮挡密码，留意有无异常装置。", severity: "critical" },
      { title: "网络钓鱼", content: "不点击陌生链接，不向\u201C银行/政府\u201D电话透露个人信息。越南的银行不会电话索要密码。", severity: "high" },
      { title: "假警察骗局", content: "真正的越南警察不会在街头要求检查钱包。遇到可疑人员要求看护照/钱包，坚持去最近的派出所。", severity: "high" },
      { title: "街头碰瓷", content: "骑摩托车或步行时，有人故意碰撞后索赔。保持冷静，必要时报警。", severity: "medium" },
      { title: "街头赌博", content: "路边猜球/纸牌游戏全是骗局，周围\u201C赢钱\u201D的人都是同伙。远离即可。", severity: "high" },
      { title: "飞车抢夺", content: "手机/包不要放在靠马路一侧。背包前背，手机用完放好。胡志明市尤其注意。", severity: "critical" },
      { title: "酒吧/KTV 高消费", content: "被陌生人邀请去酒吧要警惕。提前看菜单价格，拒绝不明酒水。账单仔细核对。", severity: "high" },
      { title: "非法换汇", content: "只在银行或正规兑换点换钱。金店/个人换汇可能遇到假币或汇率欺诈。", severity: "high" },
      { title: "海滩财物", content: "游泳时不要将手机/钱包留在沙滩上无人看管。贵重物品存酒店保险箱。", severity: "medium" },
      { title: "黑导游", content: "只使用正规旅行社。低价揽客的导游通常会带你去高回扣购物店。", severity: "medium" },
    ],
  },
  {
    id: "transport",
    label: "出行交通",
    emoji: "🏍️",
    color: "#3B82F6",
    items: [
      { title: "Grab 摩托车", content: "市区 5km 内 15,000-30,000₫。最经济的短途出行方式。高峰时段价格上浮。" },
      { title: "Grab 汽车", content: "起步 25,000₫ + 每公里 9,000-11,000₫。多人或带行李时更划算。" },
      { title: "机场到市区", content: "Grab Car 约 80,000-120,000₫（3-5km）。避免机场门口高价拉客的出租车。" },
      { title: "摩托车租赁", content: "100,000-150,000₫/天。需押护照或押金。务必检查车况、买保险、戴头盔。" },
      { title: "公交车", content: "票价 5,000-8,000₫。路线不太方便游客，但最便宜。" },
      { title: "停车费", content: "摩托车 5,000-10,000₫/次 · 汽车 20,000-50,000₫/次" },
      { title: "交通规则提醒", content: "必须戴头盔！不了解规则容易被交警拦下。国际驾照在越南不被广泛认可，注意风险。", severity: "medium" },
      { title: "出租车选择", content: "认准 Mai Linh（绿色）和 Vinasun（白色）。上车确认打表。拒绝不打表的车。", severity: "medium" },
    ],
  },
  {
    id: "dining",
    label: "餐饮美食",
    emoji: "🍜",
    color: "#10B981",
    items: [
      { title: "菜单无价格", content: "吃饭前一定要看菜单价格！无价格的菜单很可能是宰客餐厅。点餐前确认每道菜价格。", severity: "high" },
      { title: "游客价格差异", content: "同一菜品外国人可能被多收。多比较几家价格，或让当地朋友帮忙点餐。", severity: "medium" },
      { title: "账单核对", content: "结账时仔细核对每一项。注意湿巾、花生、茶水等可能被加入账单的隐性消费。", severity: "high" },
      { title: "海鲜调包", content: "选好的活海鲜可能在后厨被换成死的。可以要求在你面前加工或做标记。", severity: "high" },
      { title: "信用卡安全", content: "刷卡时不要让服务员将卡带离你的视线。建议使用手机支付或现金。", severity: "high" },
      { title: "食品安全", content: "选择生意好的摊位。少吃生食，注意餐具卫生。冰块用纯净水做的才安全。", severity: "medium" },
      { title: "推荐美食", content: "必尝：Bánh mì（法棍）、Phở（河粉）、Mì Quảng（广南面）、Bánh xèo（煎饼）、Cà phê sữa đá（冰咖啡）" },
      { title: "砍价技巧", content: "韩市场等旅游市场一定要砍价。从报价的50%-60%开始还价，最终成交价约为报价的60%-70%。" },
    ],
  },
  {
    id: "service",
    label: "生活服务",
    emoji: "\u2702\uFE0F",
    color: "#8B5CF6",
    items: [
      { title: "理发 Cắt tóc", content: "本地理发店：男 50,000-80,000₫ · 女 80,000-150,000₫。高档沙龙 200,000-500,000₫" },
      { title: "足底按摩", content: "60分钟 150,000-250,000₫。建议适当给技师小费（20,000-50,000₫）。" },
      { title: "全身按摩/Spa", content: "Spa 60-90分钟 400,000-800,000₫。水疗套餐 800,000-1,500,000₫。" },
      { title: "健身房", content: "单日卡 50,000-150,000₫ · 月卡 400,000-800,000₫" },
      { title: "洗衣 Giặt ủi", content: "20,000-30,000₫/kg。加急服务额外收费。" },
      { title: "手机 SIM 卡", content: "30天卡 150,000-250,000₫（含通话+每天5GB）。推荐 Viettel / Vinaphone。在机场或运营商门店购买最安全。", severity: "low" },
      { title: "防晒霜", content: "药店 100,000-180,000₫/50ml（Bioré/Sunplay等品牌）" },
      { title: "奥黛定制 Áo dài", content: "普通面料 800,000-1,500,000₫。丝绸等高档面料更贵。会安/岘港裁缝店可做。" },
    ],
  },
  {
    id: "rent",
    label: "租房指南",
    emoji: "🏠",
    color: "#06B6D4",
    items: [
      { title: "押金规则", content: "通常需1-3个月租金作为押金。退租时如无损坏应全额退还。务必取得收据！", severity: "high" },
      { title: "合同要点", content: "合同应为书面形式，建议中越双语版本。重要条款：租期、租金、押金、续租、退租条件、维修责任。", severity: "high" },
      { title: "水电费", content: "注意确认水电费计价方式。电费超过 4,000₫/kWh、水费超过 20,000₫/m³ 就是房东加价了。", severity: "medium" },
      { title: "验证房东身份", content: "确认房东是否为房屋实际所有人。要求查看房产证。小心二房东跑路！", severity: "high" },
      { title: "提前退租", content: "退租罚金超过2个月租金不合理。签合同前确认退租条款。" },
      { title: "收据凭证", content: "每次付款（租金、押金）都要拿到收据或银行转账凭证。口头承诺没有法律效力。", severity: "high" },
      { title: "二房东风险", content: "二房东整租后分租，收取高额租金后跑路。直接和业主签约最安全。", severity: "critical" },
      { title: "房东随意进入", content: "合同中约定房东不得在未通知的情况下进入。更换门锁或加装安全链。", severity: "medium" },
    ],
  },
  {
    id: "medical",
    label: "医疗健康",
    emoji: "🏥",
    color: "#EC4899",
    items: [
      { title: "选择正规医院", content: "优先选择有外国人服务的大型医院（如岘港C医院、Vinmec）。避免无证黑诊所！", severity: "critical" },
      { title: "费用透明", content: "就医前确认费用标准。要求提前告知检查、治疗和药品费用。保留所有收据。", severity: "high" },
      { title: "过度医疗", content: "对大量非必要检查保持警惕。可以寻求第二意见（second opinion）。", severity: "medium" },
      { title: "药品安全", content: "在正规药店购买处方药。注意包装完整、有批号。假药是严重风险！", severity: "critical" },
      { title: "医疗保险", content: "出发前购买覆盖越南的旅行/医疗保险。确认你的保险是否覆盖当地医院。" },
      { title: "语言沟通", content: "大型医院通常有英语服务。如不通语言，使用翻译App或提前准备症状描述的越南语。", severity: "medium" },
      { title: "急救电话", content: "越南急救: 115 · 报警: 113 · 消防: 114 · 岘港外国人求助热线: 0236-1022" },
      { title: "常备药物", content: "建议随身携带：止泻药、退烧药、创可贴、驱蚊液、防晒霜。热带气候易中暑脱水。" },
    ],
  },
];

/* ───────── Severity badge ───────── */
const SEVERITY_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  critical: { label: "高危", bg: "#FEE2E2", color: "#DC2626" },
  high: { label: "警惕", bg: "#FEF3C7", color: "#D97706" },
  medium: { label: "注意", bg: "#DBEAFE", color: "#2563EB" },
  low: { label: "了解", bg: "#F3F4F6", color: "#6B7280" },
};

/* ───────── Component ───────── */
export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("price");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const section = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="flex flex-col gap-0 pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white px-4 pt-5 pb-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h1 className="text-[22px] font-bold tracking-tight text-[#111]">越南生活指南</h1>
        <p className="mt-0.5 text-[13px] text-[#999]">岘港实用信息 · 物价 · 安全 · Tips</p>
      </div>

      {/* Section chips — two rows */}
      <div className="flex flex-wrap gap-2 px-4 py-3">
        {SECTIONS.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setExpandedItem(null); }}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all"
              style={{
                background: isActive ? s.color + "18" : "#F5F5F5",
                color: isActive ? s.color : "#666",
                border: isActive ? `1.5px solid ${s.color}44` : "1.5px solid transparent",
              }}
            >
              <span className="text-[15px]">{s.emoji}</span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <div className="mx-4 mb-2 flex items-center gap-2">
        <span className="text-xl">{section.emoji}</span>
        <span className="text-[16px] font-bold" style={{ color: section.color }}>{section.label}</span>
        <span className="ml-auto text-[12px] text-[#BBB]">{section.items.length} 条</span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2 px-4">
        {section.items.map((item, idx) => {
          const expanded = expandedItem === idx;
          const sev = item.severity ? SEVERITY_STYLE[item.severity] : null;
          return (
            <button
              key={idx}
              onClick={() => setExpandedItem(expanded ? null : idx)}
              className="w-full rounded-xl border bg-white p-3.5 text-left transition-all active:scale-[0.98]"
              style={{
                borderColor: expanded ? section.color + "55" : "#F0F0F0",
                boxShadow: expanded ? `0 2px 12px ${section.color}18` : "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-start gap-2">
                <span className="flex-1 text-[14px] font-semibold text-[#222] leading-snug">{item.title}</span>
                {sev && (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: sev.bg, color: sev.color }}
                  >
                    {sev.label}
                  </span>
                )}
                <svg
                  className="shrink-0 transition-transform duration-200"
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {expanded && (
                <p className="mt-2.5 text-[13px] leading-relaxed text-[#555]">{item.content}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer tips */}
      <div className="mx-4 mt-4 rounded-xl bg-[#FFF8E1] p-3.5">
        <p className="text-[12px] font-medium text-[#F59E0B]">💡 小贴士</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#92722E]">
          以上物价仅供参考，实际价格因地区、时间和店铺不同可能有所变化。如遇异常高价或可疑情况，可在首页使用AI助手获取即时建议。
        </p>
      </div>
    </div>
  );
}
