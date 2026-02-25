// ============================================================================
// VietBridge AI V2 - Scene Rules & Vietnamese Grammar
// Ported from V5 prototype SCENE_RULES (all 8 scenes)
// ============================================================================

export interface SceneRule {
  pronounSelf: string;
  pronounOther: string;
  toneDesc: string;
  particles: string[];
  formality: string;
  promptRule: string;
}

export interface Scene {
  id: SceneId;
  label: string;
  emoji: string;
}

export type SceneId =
  | "general"
  | "business"
  | "staff"
  | "couple"
  | "restaurant"
  | "rent"
  | "hospital"
  | "repair";

export const SCENES: Scene[] = [
  { id: "general", label: "通用", emoji: "🌍" },
  { id: "business", label: "商务合作", emoji: "🤝" },
  { id: "staff", label: "员工管理", emoji: "👥" },
  { id: "couple", label: "情侣沟通", emoji: "❤️" },
  { id: "restaurant", label: "餐厅点餐", emoji: "🍜" },
  { id: "rent", label: "租房", emoji: "🏠" },
  { id: "hospital", label: "看病就医", emoji: "🏥" },
  { id: "repair", label: "维修服务", emoji: "🔧" },
];

export const SCENE_COLORS: Record<SceneId, string> = {
  general: "#607D8B",
  business: "#1565C0",
  staff: "#2E7D32",
  couple: "#C62828",
  restaurant: "#E65100",
  rent: "#4527A0",
  hospital: "#00838F",
  repair: "#795548",
};

export const SCENE_RULES: Record<SceneId, SceneRule> = {
  general: {
    pronounSelf: "tôi",
    pronounOther: "bạn",
    toneDesc: "中性礼貌，适用于大多数场合",
    particles: ["ạ", "nhé", "nha"],
    formality: "neutral",
    promptRule:
      "使用标准越南语，保持中性礼貌。人称代词用tôi/bạn。句尾可加ạ表示礼貌。适用于不确定场景关系时的安全选择。",
  },
  business: {
    pronounSelf: "tôi",
    pronounOther: "anh/chị",
    toneDesc: "正式商务，尊重对方",
    particles: ["ạ", "vâng", "dạ"],
    formality: "formal",
    promptRule:
      "使用正式越南语商务用语。称呼用anh/chị（根据对方性别），自称tôi。句尾必须加ạ表示尊敬。避免俚语和缩写。涉及金额时使用正式数字表达。合同相关术语需准确。商务谈判时注意越南文化中的面子概念。",
  },
  staff: {
    pronounSelf: "anh/chị",
    pronounOther: "em",
    toneDesc: "上级对下属，亲切但有权威",
    particles: ["nhé", "nha", "nghe"],
    formality: "semi-formal",
    promptRule:
      "以上级身份说话，自称anh/chị，称呼员工为em。语气亲切但保持权威。可以用nhé/nha软化命令语气。涉及工作安排时要清晰直接。越南职场文化重视等级关系，指令要明确但不失温和。批评时注意保留面子。",
  },
  couple: {
    pronounSelf: "anh/em",
    pronounOther: "em/anh",
    toneDesc: "亲密情侣，温柔甜蜜",
    particles: ["yêu", "nhé", "nha", "à", "ơi"],
    formality: "intimate",
    promptRule:
      "使用越南语情侣间的亲密用语。男方自称anh，称女方em；女方自称em，称男方anh。可以使用yêu(爱)、nhớ(想)等甜蜜词汇。句尾加à/ơi表示亲昵。注意越南情侣文化中的撒娇表达方式。语气要温柔，避免生硬的翻译腔。",
  },
  restaurant: {
    pronounSelf: "tôi/mình",
    pronounOther: "chị/anh (服务员)/bạn (朋友)",
    toneDesc: "轻松日常，点餐用语",
    particles: ["ơi", "cho", "với"],
    formality: "casual",
    promptRule:
      "使用越南餐厅常用表达。叫服务员用ơi（如：chị ơi, em ơi）。点菜用cho tôi/cho mình。结账说tính tiền。熟悉岘港本地菜名（如mì Quảng广面, bánh tráng cuốn thịt heo春卷）。价格讨论时注意越南盾单位。了解越南餐厅文化（如不用给小费但可以留零头）。",
  },
  rent: {
    pronounSelf: "tôi",
    pronounOther: "anh/chị (房东)",
    toneDesc: "半正式，租房谈判",
    particles: ["ạ", "không ạ", "được không"],
    formality: "semi-formal",
    promptRule:
      "使用租房相关的越南语表达。涉及合同(hợp đồng)、押金(tiền cọc)、月租(tiền thuê hàng tháng)等专业术语。了解岘港租房市场行情和常见条款。注意越南租房文化中的潜规则（如押金通常1-2个月，水电费另算）。谈判时保持礼貌但要坚定。合同条款翻译需准确无歧义。",
  },
  hospital: {
    pronounSelf: "tôi",
    pronounOther: "bác sĩ (医生)/y tá (护士)",
    toneDesc: "正式恭敬，医疗场景",
    particles: ["ạ", "dạ", "vâng"],
    formality: "formal",
    promptRule:
      "使用医疗相关越南语。症状描述要准确（如đau đầu头痛, sốt发烧, ho咳嗽）。称呼医生为bác sĩ，护士为y tá/điều dưỡng。必须使用敬语。了解越南医疗系统流程（挂号→检查→开药→取药）。药品名称尽量使用通用名。紧急情况的常用表达要准确。身体部位和症状词汇要精确。",
  },
  repair: {
    pronounSelf: "tôi/mình",
    pronounOther: "anh (师傅)",
    toneDesc: "日常友好，请师傅修东西",
    particles: ["ơi", "giúp", "với", "được không"],
    formality: "casual",
    promptRule:
      "使用维修服务相关越南语。称呼师傅通常用anh。描述故障要具体（如hỏng坏了, bị rò rỉ漏水, không hoạt động不工作）。讨论价格时注意岘港本地行情。了解常见家电家具的越南语名称。请求帮助用giúp/với。谈价时可以适当还价但要合理。注意越南维修行业的收费习惯。",
  },
};
