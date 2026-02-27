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
  | "housekeeping"
  | "ktv"
  | "dirtyword"
  | "transport"
  | "mlove"
  | "customer"
  | "pickup"
  | "antiscam";

export const SCENES: Scene[] = [
  { id: "general", label: "通用", emoji: "🌍" },
  { id: "business", label: "商务合作", emoji: "🤝" },
  { id: "staff", label: "员工管理", emoji: "👥" },
  { id: "couple", label: "情侣沟通", emoji: "❤️" },
  { id: "restaurant", label: "餐厅点餐", emoji: "🍜" },
  { id: "rent", label: "租房", emoji: "🏠" },
  { id: "hospital", label: "看病就医", emoji: "🏥" },
  { id: "housekeeping", label: "家政服务", emoji: "🧹" },
  { id: "ktv", label: "KTV夜生活", emoji: "🎤" },
  { id: "dirtyword", label: "吵架骂人", emoji: "🤬" },
  { id: "transport", label: "交通摩托", emoji: "🏍️" },
  { id: "mlove", label: "情侣亲密", emoji: "🔥" },
  { id: "customer", label: "消费购物", emoji: "🛒" },
  { id: "pickup", label: "认识陌生人", emoji: "👋" },
  { id: "antiscam", label: "防被宰", emoji: "🛡️" },
];

export const SCENE_COLORS: Record<SceneId, string> = {
  general: "#607D8B",
  business: "#1565C0",
  staff: "#2E7D32",
  couple: "#C62828",
  restaurant: "#E65100",
  rent: "#4527A0",
  hospital: "#00838F",
  housekeeping: "#795548",
  ktv: "#9C27B0",
  dirtyword: "#D32F2F",
  transport: "#FF6F00",
  mlove: "#E91E63",
  customer: "#00897B",
  pickup: "#5C6BC0",
  antiscam: "#F44336",
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
  housekeeping: {
    pronounSelf: "tôi/mình",
    pronounOther: "chị/em (阿姨/保姆)",
    toneDesc: "日常友好，家政沟通",
    particles: ["ơi", "giúp", "với", "nhé"],
    formality: "casual",
    promptRule:
      "使用家政服务相关越南语。称呼家政人员通常用chị/em。工作安排要清晰（如lau nhà拖地, giặt đồ洗衣, nấu ăn做饭, dọn dẹp打扫）。讨论薪资用lương/tiền công。了解岘港家政市场行情。时间安排用giờ/buổi。注意越南家政文化中的礼貌用语。沟通清洁标准和注意事项时要具体明确。",
  },
  ktv: {
    pronounSelf: "tôi/mình",
    pronounOther: "bạn/em",
    toneDesc: "轻松随意，夜生活娱乐场景",
    particles: ["ơi", "đi", "nha", "nhé"],
    formality: "casual",
    promptRule:
      "KTV/夜生活场景。语气轻松随意。常用点歌(chọn bài)、倒酒(rót rượu)、干杯(cạn ly/dzô)等表达。了解岘港KTV文化和常见消费陷阱。注意价格确认和账单核对。越南KTV常见的隐性消费（如开瓶费、小费、最低消费）要提醒用户注意。",
  },
  dirtyword: {
    pronounSelf: "tao/tôi",
    pronounOther: "mày/bạn",
    toneDesc: "粗鲁直接，吵架冲突场景",
    particles: ["đấy", "đi", "à"],
    formality: "vulgar",
    promptRule:
      "吵架/冲突场景翻译。用户可能需要理解对方骂人的话或表达不满。翻译要准确但同时标注语气等级和文化影响。tao/mày是粗鲁人称，相当于'老子/你丫'。提醒用户越南文化中骂人的后果和风险。建议用户优先使用礼貌但坚定的表达来解决冲突。",
  },
  transport: {
    pronounSelf: "tôi",
    pronounOther: "anh (司机)/bạn",
    toneDesc: "日常实用，交通出行场景",
    particles: ["ơi", "cho", "được không"],
    formality: "casual",
    promptRule:
      "交通出行场景。涉及打车(xe ôm/Grab)、租摩托(thuê xe máy)、问路(hỏi đường)等。了解岘港交通规则和常见路线。摩托车租赁注意事项（如驾照、保险、押金）。Grab打车用语。公交信息。注意交通安全提醒和常见骗局（如绕路、乱收费）。",
  },
  mlove: {
    pronounSelf: "anh/em",
    pronounOther: "em/anh",
    toneDesc: "亲密暧昧，浪漫约会场景",
    particles: ["yêu", "nhé", "à", "ơi", "quá"],
    formality: "intimate",
    promptRule:
      "亲密/约会场景。比couple更加暧昧亲密。越南语中的调情表达、甜言蜜语、约会邀请等。了解越南约会文化。常用浪漫表达（如anh nhớ em想你, em đẹp quá你真美）。注意文化差异中的禁忌话题。岘港约会热门地点推荐可适当融入。",
  },
  customer: {
    pronounSelf: "tôi/mình",
    pronounOther: "chị/anh (店员)",
    toneDesc: "消费场景，讨价还价",
    particles: ["ơi", "bớt", "cho", "được không"],
    formality: "casual",
    promptRule:
      "消费购物场景。涉及砍价(trả giá/bớt)、询价(bao nhiêu tiền)、退换货等。了解岘港各大市场（如韩市场Chợ Hàn、大市场Chợ Cồn）的行情。越南砍价文化和技巧。常见商品越南语名称。注意识别旅游区价格虚高的情况。提醒用户合理价格范围。",
  },
  pickup: {
    pronounSelf: "mình/tôi",
    pronounOther: "bạn",
    toneDesc: "友好开朗，社交破冰",
    particles: ["nhé", "nha", "không", "đi"],
    formality: "casual",
    promptRule:
      "社交破冰/认识新朋友场景。自我介绍(giới thiệu)、搭话(bắt chuyện)、交换联系方式等。越南社交文化中的礼貌开场方式。常用破冰话题（如来自哪里、在岘港做什么）。注意越南人对陌生人的态度和文化习惯。建议自然友好的表达方式。",
  },
  antiscam: {
    pronounSelf: "tôi",
    pronounOther: "anh/chị/bạn",
    toneDesc: "警惕坚定，防骗场景",
    particles: ["ạ", "không", "được không"],
    formality: "neutral",
    promptRule:
      "防骗/防被宰场景。重点是帮助用户识别和应对常见骗局。涉及拒绝高价(mắc quá)、要求看账单(cho tôi xem hóa đơn)、投诉(khiếu nại)等表达。了解岘港常见针对游客/华人的骗局。提供坚定但不失礼貌的拒绝话术。提醒用户如何保护自己的权益。紧急情况下的求助表达（如报警gọi công an）。",
  },
};
