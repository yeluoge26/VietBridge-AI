export interface DailyPhrase {
  vi: string;
  zh: string;
  pinyin: string;
  culture: string;
  scene: string;
}

export const DAILY_PHRASES: DailyPhrase[] = [
  { vi: "Xin chào, hôm nay bạn khỏe không?", zh: "你好，你今天好吗？", pinyin: "sin chào, hôm nay bạn khỏe không?", culture: "\"khỏe không\" 是关心近况的固定问候，越南人见面常说", scene: "general" },
  { vi: "Cho tôi xem menu được không?", zh: "可以给我看菜单吗？", pinyin: "cho tôi xem me-niu đươc không?", culture: "在餐厅点菜前先要菜单是基本礼仪，\"được không\" 表示礼貌请求", scene: "restaurant" },
  { vi: "Cái này bao nhiêu tiền?", zh: "这个多少钱？", pinyin: "cái này bao nhiêu tiền?", culture: "购物必备句型，\"bao nhiêu\" 意为多少，\"tiền\" 是钱", scene: "general" },
  { vi: "Anh/Chị có thể giảm giá được không?", zh: "可以打折吗？", pinyin: "anh/chị có thể giảm giá đươc không?", culture: "越南市场和路边摊通常可以讲价，用\"giảm giá\"礼貌地问", scene: "restaurant" },
  { vi: "Tôi muốn thuê phòng, giá bao nhiêu một tháng?", zh: "我想租房，一个月多少钱？", pinyin: "tôi muốn thuê phòng, giá bao nhiêu một tháng?", culture: "\"thuê phòng\" 是租房，在岘港租房一般按月付，\"một tháng\" 是一个月", scene: "rent" },
  { vi: "Làm ơn gọi xe cấp cứu!", zh: "请叫救护车！", pinyin: "làm ơn gọi xe cấp cứu!", culture: "紧急情况下使用。越南急救电话是115，\"cấp cứu\" 意为急救", scene: "hospital" },
  { vi: "Em yêu anh/chị nhiều lắm.", zh: "我很爱你。", pinyin: "em yêu anh/chị nhiều lắm.", culture: "\"em\" 是年幼者的自称，对恋人说时充满温柔。\"nhiều lắm\" 加强程度", scene: "couple" },
  { vi: "Hợp đồng này cần thêm điều khoản gì không?", zh: "这份合同还需要增加什么条款吗？", pinyin: "hợp đồng này cần thêm điều khoản gì không?", culture: "\"hợp đồng\" 是合同，\"điều khoản\" 是条款。签合同前一定要仔细看", scene: "business" },
  { vi: "Sửa cái này hết bao nhiêu tiền?", zh: "修这个要多少钱？", pinyin: "sửa cái này hết bao nhiêu tiền?", culture: "\"sửa\" 是修理。记得维修前先问价，\"hết\" 表示总共", scene: "housekeeping" },
  { vi: "Tháng này lương của em được bao nhiêu?", zh: "这个月我的工资是多少？", pinyin: "tháng này lương của em đươc bao nhiêu?", culture: "\"lương\" 是工资，\"của em\" 是\"我的\"(下级对上级)。了解薪酬结构很重要", scene: "staff" },
  { vi: "Cảm ơn anh/chị rất nhiều!", zh: "非常感谢您！", pinyin: "cảm ơn anh/chị rất nhiều!", culture: "\"cảm ơn\" 是感谢，\"rất nhiều\" 加强语气。越南人重视礼貌用语", scene: "general" },
  { vi: "Tôi bị đau bụng, cần đi khám bác sĩ.", zh: "我肚子痛，需要看医生。", pinyin: "tôi bị đau bụng, cần đi khám bác sĩ.", culture: "\"đau bụng\" 是肚子痛，\"bác sĩ\" 是医生。岘港推荐去Vinmec或公立医院", scene: "hospital" },
  { vi: "Wifi ở đây mật khẩu là gì?", zh: "这里的WiFi密码是什么？", pinyin: "wifi ở đây mật khẩu là gì?", culture: "越南咖啡店几乎都有免费WiFi，\"mật khẩu\" 是密码", scene: "general" },
  { vi: "Đi thẳng rồi rẽ trái.", zh: "直走然后左转。", pinyin: "đi thẳng rồi rẽ trái.", culture: "\"thẳng\" 是直走，\"rẽ trái\" 左转，\"rẽ phải\" 右转。问路必备", scene: "general" },
];

export function getTodayPhrase(): DailyPhrase {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];
}

export function getPhrasesByScene(scene: string): DailyPhrase[] {
  if (scene === "general" || !scene) return DAILY_PHRASES;
  return DAILY_PHRASES.filter((p) => p.scene === scene || p.scene === "general");
}
