// ============================================================================
// VietBridge AI V2 - Knowledge Base
// Ported from V5 prototype KNOWLEDGE_BASE
// Da Nang-focused local knowledge for risk analysis and proactive warnings
// ============================================================================

export interface KBHit {
  source: string;
  confidence: number;
  detail: string;
}

export interface KBPriceEntry {
  item: string;
  local: string;
  tourist: string;
  note: string;
}

export interface KBRentRule {
  rule: string;
  detail: string;
  risk: string;
}

export interface KBContractClause {
  clause: string;
  risk: string;
  suggestion: string;
}

export interface KBScamPattern {
  pattern: string;
  scene: string;
  indicators: string[];
  response: string;
}

export interface KBCategory<T> {
  source: string;
  updated: string;
  confidence: number;
  data?: T[];
  rules?: T[];
  patterns?: T[];
}

export interface KnowledgeBase {
  danang_prices: KBCategory<KBPriceEntry>;
  rent_rules: KBCategory<KBRentRule>;
  contract_clauses: KBCategory<KBContractClause>;
  scam_patterns: KBCategory<KBScamPattern>;
}

export const KNOWLEDGE_BASE: KnowledgeBase = {
  danang_prices: {
    source: "岘港本地调研",
    updated: "2025-01",
    confidence: 0.85,
    data: [
      {
        item: "mì Quảng (广面)",
        local: "25,000-35,000 VND",
        tourist: "50,000-80,000 VND",
        note: "路边摊vs餐厅价格差距大",
      },
      {
        item: "bánh mì (越南法棍)",
        local: "15,000-20,000 VND",
        tourist: "30,000-50,000 VND",
        note: "热门旅游区价格翻倍",
      },
      {
        item: "phở (河粉)",
        local: "30,000-45,000 VND",
        tourist: "60,000-100,000 VND",
        note: "品牌店vs街边摊",
      },
      {
        item: "cà phê sữa đá (冰奶咖啡)",
        local: "15,000-25,000 VND",
        tourist: "35,000-60,000 VND",
        note: "连锁店价格固定，路边摊可议",
      },
      {
        item: "bún chả cá (鱼饼米粉)",
        local: "30,000-40,000 VND",
        tourist: "50,000-80,000 VND",
        note: "岘港特色菜",
      },
      {
        item: "bánh tráng cuốn thịt heo (猪肉春卷)",
        local: "40,000-60,000 VND/份",
        tourist: "80,000-120,000 VND/份",
        note: "岘港名菜，分量差异大",
      },
      {
        item: "海鲜 (一般)",
        local: "按市场价",
        tourist: "加价30-100%",
        note: "一定要提前问价，最好去本地人常去的市场",
      },
      {
        item: "Grab出租车 (5km)",
        local: "25,000-35,000 VND",
        tourist: "同价 (App计价)",
        note: "用Grab比路边出租车靠谱，避免被坑",
      },
    ],
  },

  rent_rules: {
    source: "岘港外国人租房经验汇总",
    updated: "2025-01",
    confidence: 0.8,
    rules: [
      {
        rule: "押金标准",
        detail: "通常1-2个月房租作为押金(tiền cọc)",
        risk: "超过2个月押金需警惕",
      },
      {
        rule: "水电费",
        detail: "电费按政府阶梯价3,000-4,000 VND/kWh，水费约10,000 VND/m³",
        risk: "房东加价收取水电费很常见，需在合同注明按表计费",
      },
      {
        rule: "合同期限",
        detail: "通常6个月或1年起租",
        risk: "提前退租可能损失全部押金",
      },
      {
        rule: "涨租限制",
        detail: "合同期内不得涨租，续约涨幅通常10-15%",
        risk: "无书面合同时房东可能随时涨租",
      },
      {
        rule: "维修责任",
        detail: "结构性问题由房东负责，日常损耗由租客负责",
        risk: "合同中未明确维修责任分工时容易产生纠纷",
      },
      {
        rule: "退租检查",
        detail: "退租时房东检查房屋状况，正常磨损不应扣押金",
        risk: "建议入住时拍照留证，退租时对比",
      },
      {
        rule: "外国人登记",
        detail: "房东有义务帮外国租客做暂住登记(đăng ký tạm trú)",
        risk: "不登记可能导致罚款，影响签证续签",
      },
    ],
  },

  contract_clauses: {
    source: "越南租房合同常见条款分析",
    updated: "2025-01",
    confidence: 0.75,
    rules: [
      {
        clause: "提前解约条款",
        risk: "很多合同规定提前解约需支付1-2个月违约金",
        suggestion: "争取加入「提前30天通知可免违约金」条款",
      },
      {
        clause: "押金退还条款",
        risk: "模糊的押金退还条件让房东有借口扣押金",
        suggestion: "明确写入「正常损耗不扣押金，退租后7天内退还」",
      },
      {
        clause: "水电费计算方式",
        risk: "房东可能按高于政府标准的价格收取",
        suggestion: "合同注明「按政府公布价格，按表计费」",
      },
      {
        clause: "设施清单",
        risk: "入住时未核对设施，退租时被要求赔偿",
        suggestion: "签约时列出所有设施清单并拍照存档",
      },
      {
        clause: "转租条款",
        risk: "未约定转租条件，可能被房东拒绝",
        suggestion: "如有需要，提前在合同中加入转租许可条款",
      },
      {
        clause: "涨租条款",
        risk: "合同到期后房东大幅涨租",
        suggestion: "合同中约定续租涨幅上限（如不超过10%）",
      },
    ],
  },

  scam_patterns: {
    source: "在越华人社区反诈经验",
    updated: "2025-01",
    confidence: 0.9,
    patterns: [
      {
        pattern: "餐厅宰客",
        scene: "restaurant",
        indicators: [
          "没有菜单或菜单无价格",
          "海鲜不标价，按「市场价」结算",
          "结账金额与预期差距大",
          "强制收取高额服务费",
        ],
        response:
          "点菜前要求看有价格的菜单，海鲜提前确认价格并拍照。如遇争议，可以威胁拨打越南旅游投诉热线1039。",
      },
      {
        pattern: "出租车绕路",
        scene: "general",
        indicators: [
          "拒绝打表",
          "表跳得异常快",
          "故意绕远路",
          "到达后临时加价",
        ],
        response:
          "优先使用Grab等打车软件。如坐出租车，上车前确认打表，记住车牌号。岘港出租车推荐Mai Linh或Vinasun。",
      },
      {
        pattern: "租房押金骗局",
        scene: "rent",
        indicators: [
          "要求高额押金（超过2个月）",
          "不提供正式合同",
          "拒绝做暂住登记",
          "退租时以各种理由扣押金",
        ],
        response:
          "签正式合同，押金最多2个月。入住拍照留证。找有营业执照的中介或通过可靠朋友介绍。",
      },
      {
        pattern: "维修乱收费",
        scene: "housekeeping",
        indicators: [
          "不提前报价就开始维修",
          "维修后价格远超报价",
          "声称需要更换昂贵零件",
          "制造恐慌催促决定",
        ],
        response:
          "维修前要求书面报价。大额维修找2-3家比价。可以请越南朋友帮忙沟通或陪同。",
      },
      {
        pattern: "合同陷阱",
        scene: "business",
        indicators: [
          "只有越南语合同没有中文/英文版",
          "关键条款含糊不清",
          "口头承诺不写入合同",
          "催促签字不给时间审核",
        ],
        response:
          "要求中越双语合同。关键条款请专业翻译确认。不要在压力下签字。大额合同建议请律师审核。",
      },
      {
        pattern: "医疗乱收费",
        scene: "hospital",
        indicators: [
          "不必要的额外检查",
          "药品价格远高于药店",
          "推荐不必要的住院",
          "拒绝提供收费明细",
        ],
        response:
          "优先去公立医院或知名私立医院。要求查看收费标准。小病可以先去药店咨询。保留所有收据。",
      },
    ],
  },
};

/**
 * Search the knowledge base for relevant hits based on input text and scene.
 */
export function searchKnowledgeBase(
  input: string,
  scene: string
): KBHit[] {
  const hits: KBHit[] = [];
  const lowerInput = input.toLowerCase();

  // Check price-related queries
  if (
    scene === "restaurant" ||
    /价格|多少钱|bao nhiêu|giá|贵|便宜|宰/.test(lowerInput)
  ) {
    const priceData = KNOWLEDGE_BASE.danang_prices.data;
    if (priceData) {
      for (const entry of priceData) {
        if (
          lowerInput.includes(entry.item.toLowerCase()) ||
          lowerInput.includes(entry.item.split("(")[0].trim().toLowerCase())
        ) {
          hits.push({
            source: KNOWLEDGE_BASE.danang_prices.source,
            confidence: KNOWLEDGE_BASE.danang_prices.confidence,
            detail: `${entry.item}: 本地价${entry.local}，游客价${entry.tourist}。${entry.note}`,
          });
        }
      }
    }
  }

  // Check rent-related queries
  if (
    scene === "rent" ||
    /租|房|押金|合同|cọc|thuê|hợp đồng/.test(lowerInput)
  ) {
    const rentRules = KNOWLEDGE_BASE.rent_rules.rules;
    if (rentRules) {
      for (const rule of rentRules) {
        if (
          lowerInput.includes(rule.rule.toLowerCase()) ||
          lowerInput.includes(rule.detail.substring(0, 4).toLowerCase())
        ) {
          hits.push({
            source: KNOWLEDGE_BASE.rent_rules.source,
            confidence: KNOWLEDGE_BASE.rent_rules.confidence,
            detail: `${rule.rule}: ${rule.detail}。风险提示: ${rule.risk}`,
          });
        }
      }
    }
  }

  // Check scam patterns
  const scamPatterns = KNOWLEDGE_BASE.scam_patterns.patterns;
  if (scamPatterns) {
    for (const pattern of scamPatterns) {
      if (
        pattern.scene === scene ||
        pattern.indicators.some((indicator) =>
          lowerInput.includes(indicator.substring(0, 4).toLowerCase())
        )
      ) {
        hits.push({
          source: KNOWLEDGE_BASE.scam_patterns.source,
          confidence: KNOWLEDGE_BASE.scam_patterns.confidence,
          detail: `⚠️ ${pattern.pattern}: ${pattern.response}`,
        });
      }
    }
  }

  return hits;
}
