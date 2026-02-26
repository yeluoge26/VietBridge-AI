// ============================================================================
// Seed script: Import anti-scam (防被宰) scene phrases
// Run: npx tsx prisma/seed-antiscam.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Phrase {
  scene: string;
  zh: string;
  vi: string;
  pinyin: string;
  culture: string;
  sortOrder: number;
}

const phrases: Phrase[] = [];
let order = 0;
const seen = new Set<string>();

function add(zh: string, vi: string, pinyin: string, culture: string) {
  // Deduplicate by Vietnamese text
  const key = vi.trim();
  if (seen.has(key)) return;
  seen.add(key);
  phrases.push({ scene: "antiscam", zh, vi, pinyin, culture, sortOrder: order++ });
}

// ── table.csv — 海鲜防宰 (100 rows, ~65 unique after dedup) ──
add("这个海鲜多少钱一斤？", "Hải sản này bao nhiêu một ký ạ?", "Hải sản này bao nhiêu một ký ạ?", "ký=公斤，买海鲜必问价");
add("太贵了，能便宜点吗？", "Đắt quá, giảm chút được không ạ?", "Đắt quá, giảm chút được không ạ?", "砍价万能句");
add("我知道市场价是多少", "Em biết giá chợ là bao nhiêu ạ", "Em biết giá chợ là bao nhiêu ạ", "表明知道行情");
add("别加冰称重了", "Đừng cho đá vào cân ạ", "Đừng cho đá vào cân ạ", "海鲜市场常见手段，加冰增重");
add("这个是死的，为什么卖这么贵？", "Con này chết rồi, sao bán đắt thế ạ?", "Con này chết rồi...", "死海鲜不该卖活海鲜价");
add("称重前先给我看秤", "Cân trước cho em xem cân nhé ạ", "Cân trước cho em xem cân nhé ạ", "检查秤是否归零");
add("你秤重错了，多算了", "Anh/chị cân nhầm rồi, tính thừa ạ", "Anh/chị cân nhầm rồi...", "指出称重错误");
add("别骗我，我在别摊看到更便宜", "Đừng lừa em, em thấy chỗ khác rẻ hơn ạ", "Đừng lừa em...", "用价格比较施压");
add("这个虾/蟹不新鲜", "Tôm/cua này không tươi ạ", "Tôm/cua này không tươi ạ", "指出不新鲜");
add("我只要活的，不要死的", "Em chỉ lấy con sống thôi, không lấy con chết ạ", "Em chỉ lấy con sống thôi...", "坚持只买活海鲜");
add("帮我挑活蹦乱跳的", "Chọn giúp em con còn nhảy tanh tách nhé ạ", "Chọn giúp em con còn nhảy...", "要求选活跃的");
add("别加水/冰进去称", "Đừng đổ nước/đá vào cân ạ", "Đừng đổ nước/đá vào cân ạ", "防止加水增重");
add("这斤两不对，重称一次", "Cân nặng không đúng, cân lại lần nữa ạ", "Cân nặng không đúng...", "要求重新称重");
add("你多收了，能退吗？", "Anh/chị tính thừa, hoàn lại được không ạ?", "Anh/chị tính thừa...", "要求退多收的钱");
add("我只付这个价", "Em chỉ trả giá này thôi ạ", "Em chỉ trả giá này thôi ạ", "坚持自己的价格");
add("别宰游客，我是常客", "Đừng chặt du khách, em là khách quen ạ", "Đừng chặt du khách...", "chặt=宰客");
add("这价格我接受不了", "Giá này em không chấp nhận ạ", "Giá này em không chấp nhận ạ", "明确拒绝价格");
add("我在网上查了价格", "Em tra giá trên mạng rồi ạ", "Em tra giá trên mạng rồi ạ", "用网络价格施压");
add("别加服务费/加工费", "Đừng tính phí chế biến / phí dịch vụ ạ", "Đừng tính phí chế biến...", "拒绝额外费用");
add("我自己带回家煮", "Em tự mang về nấu ạ", "Em tự mang về nấu ạ", "避免加工费");
add("别卖死货给我", "Đừng bán hàng chết cho em ạ", "Đừng bán hàng chết cho em ạ", "拒绝死海鲜");
add("这个螃蟹/虾怎么这么贵？", "Cua/tôm này sao đắt thế ạ?", "Cua/tôm này sao đắt thế ạ?", "质疑高价");
add("我买多，能便宜点吗？", "Em mua nhiều, giảm giá được không ạ?", "Em mua nhiều...", "批量砍价");
add("别加小费，我不给", "Đừng tính tip, em không cho ạ", "Đừng tính tip...", "越南不强制小费");
add("东西质量差，不值这个价", "Đồ chất lượng kém, không đáng giá này ạ", "Đồ chất lượng kém...", "质量不好拒绝高价");
add("请给我看秤零点", "Cho em xem cân về zero nhé ạ", "Cho em xem cân về zero nhé ạ", "要求秤归零");
add("别用手压秤", "Đừng dùng tay ấn cân ạ", "Đừng dùng tay ấn cân ạ", "防止用手压秤作弊");
add("我拍照留证据", "Em chụp ảnh làm bằng chứng ạ", "Em chụp ảnh làm bằng chứng ạ", "威慑手段");
add("叫市场管理人员来", "Gọi quản lý chợ đến nhé", "Gọi quản lý chợ đến nhé", "找管理员投诉");
add("我付这个就走", "Em trả giá này rồi đi ạ", "Em trả giá này rồi đi ạ", "强硬付款走人");
add("别以为游客好骗", "Đừng nghĩ du khách dễ lừa ạ", "Đừng nghĩ du khách dễ lừa ạ", "表明不好骗");
add("这虾/蟹不值这个价", "Tôm/cua không đáng giá này ạ", "Tôm/cua không đáng giá này ạ", "质疑价格");
add("别加冰再称", "Đừng cho đá vào rồi cân lại ạ", "Đừng cho đá vào rồi cân lại ạ", "防冰增重");
add("我只买活的", "Em chỉ mua con sống thôi ạ", "Em chỉ mua con sống thôi ạ", "只买活海鲜");
add("这个死了，我不要", "Con này chết rồi, em không lấy ạ", "Con này chết rồi...", "拒绝死货");
add("价格太高，我走人", "Giá cao quá, em đi đây ạ", "Giá cao quá, em đi đây ạ", "假装走人砍价");
add("别加加工费，我自己处理", "Đừng tính phí làm sạch, em tự làm ạ", "Đừng tính phí làm sạch...", "自己处理省钱");
add("我知道附近摊位更便宜", "Em biết chỗ gần đây rẻ hơn ạ", "Em biết chỗ gần đây rẻ hơn ạ", "用竞争施压");
add("别再多算斤两", "Đừng tính thêm ký nữa ạ", "Đừng tính thêm ký nữa ạ", "防多算重量");
add("这海鲜我只付市场价", "Hải sản này em chỉ trả giá chợ ạ", "Hải sản này em chỉ trả giá chợ ạ", "只付市场价");
add("谢谢，我不买了", "Cảm ơn, em không mua nữa ạ", "Cảm ơn, em không mua nữa ạ", "礼貌拒绝");
add("你这样我会发到网上", "Anh/chị làm vậy em đăng lên mạng ạ", "Anh/chị làm vậy em đăng lên mạng ạ", "用网络曝光威慑");
add("别加隐藏费用", "Đừng tính phí ẩn ạ", "Đừng tính phí ẩn ạ", "拒绝隐藏费用");
add("我付现金就这个数", "Em trả tiền mặt chỉ số này thôi ạ", "Em trả tiền mặt chỉ số này thôi ạ", "现金支付坚定");
add("这不是活海鲜", "Đây không phải hải sản sống ạ", "Đây không phải hải sản sống ạ", "指出不是活的");
add("帮我挑大的", "Chọn giúp em con to nhé ạ", "Chọn giúp em con to nhé ạ", "要求选大的");
add("别卖给我小的", "Đừng bán con nhỏ cho em ạ", "Đừng bán con nhỏ cho em ạ", "拒绝小的");
add("称重后我自己看", "Cân xong em tự xem nhé ạ", "Cân xong em tự xem nhé ạ", "自己检查重量");
add("别用湿秤", "Đừng dùng cân ướt ạ", "Đừng dùng cân ướt ạ", "湿秤会多出重量");
add("我知道秤有问题", "Em biết cân có vấn đề ạ", "Em biết cân có vấn đề ạ", "指出秤有问题");
add("别再骗我了", "Đừng lừa em nữa ạ", "Đừng lừa em nữa ạ", "直接戳穿");
add("我只付一半", "Em chỉ trả một nửa ạ", "Em chỉ trả một nửa ạ", "强硬砍价");
add("这质量太差", "Chất lượng kém quá ạ", "Chất lượng kém quá ạ", "指出质量问题");
add("我要找市场管理", "Em muốn gặp quản lý chợ ạ", "Em muốn gặp quản lý chợ ạ", "找管理投诉");
add("别加服务费", "Đừng tính phí dịch vụ ạ", "Đừng tính phí dịch vụ ạ", "拒绝服务费");
add("我知道你们套路", "Em biết chiêu trò của anh/chị ạ", "Em biết chiêu trò của anh/chị ạ", "表明懂套路");
add("这价格我走人", "Giá này em bỏ đi ạ", "Giá này em bỏ đi ạ", "走人施压");
add("别再宰游客", "Đừng chặt chém du khách nữa ạ", "Đừng chặt chém du khách nữa ạ", "chặt chém=宰客");
add("我付这个就结束", "Em trả cái này là xong ạ", "Em trả cái này là xong ạ", "付款终结");
add("你这样我会录像", "Anh/chị làm vậy em quay video ạ", "Anh/chị làm vậy em quay video ạ", "录像威慑");
add("别再多要小费", "Đừng đòi thêm tip nữa ạ", "Đừng đòi thêm tip nữa ạ", "拒绝加小费");
add("我知道岘港规矩", "Em biết quy tắc Đà Nẵng ạ", "Em biết quy tắc Đà Nẵng ạ", "表明了解当地");
add("别以为我好欺负", "Đừng nghĩ em dễ bắt nạt ạ", "Đừng nghĩ em dễ bắt nạt ạ", "表明不好欺负");
add("别再骗游客了", "Đừng lừa du khách nữa ạ", "Đừng lừa du khách nữa ạ", "警告别骗游客");
add("我有朋友在岘港警察局", "Em có bạn ở công an Đà Nẵng ạ", "Em có bạn ở công an Đà Nẵng ạ", "威慑手段，công an=公安/警察");
add("算了，我走人", "Thôi, em đi đây ạ", "Thôi, em đi đây ạ", "放弃走人");
add("下次我不会再来了", "Lần sau em không quay lại đâu ạ", "Lần sau em không quay lại đâu ạ", "表明不会再来");

// ── table(1).csv — 综合防宰（出租车、餐厅、KTV等）(100 rows, ~65 unique after dedup) ──
add("太贵了，这不是正常价", "Đắt quá, giá này không bình thường ạ", "Đắt quá, giá này không bình thường ạ", "指出价格不正常");
add("我知道真实价格是多少", "Em biết giá thật là bao nhiêu ạ", "Em biết giá thật là bao nhiêu ạ", "表明知道真价");
add("你多算钱了", "Anh/chị tính thừa tiền rồi ạ", "Anh/chị tính thừa tiền rồi ạ", "指出多收费");
add("别骗我，我不是第一次来", "Đừng lừa em, em không phải lần đầu ạ", "Đừng lừa em...", "表明是老手");
add("这不是我点的菜", "Em không gọi món này ạ", "Em không gọi món này ạ", "餐厅加菜防骗");
add("请给我看原始菜单", "Cho em xem thực đơn gốc ạ", "Cho em xem thực đơn gốc ạ", "防两本菜单");
add("我用Grab付，不用现金", "Em trả qua Grab, không dùng tiền mặt ạ", "Em trả qua Grab...", "Grab打车有记录更安全");
add("你这样我会投诉", "Anh/chị làm vậy em sẽ khiếu nại ạ", "Anh/chị làm vậy em sẽ khiếu nại ạ", "投诉警告");
add("这是宰客行为", "Đây là chặt chém khách ạ", "Đây là chặt chém khách ạ", "直接指出宰客");
add("我只付合理价格", "Em chỉ trả giá hợp lý thôi ạ", "Em chỉ trả giá hợp lý thôi ạ", "只付合理价");
add("停车仔多收了10k", "Anh giữ xe tính thêm 10k rồi ạ", "Anh giữ xe tính thêm 10k rồi ạ", "越南停车仔常多收费");
add("别再加价了，我不接受", "Đừng tăng giá nữa, em không chấp nhận ạ", "Đừng tăng giá nữa...", "拒绝涨价");
add("出租车不打表我就不坐", "Taxi không bật đồng hồ em không đi ạ", "Taxi không bật đồng hồ...", "坚持打表，đồng hồ=计价器");
add("这瓶水才10k，你卖30k", "Chai nước này chỉ 10k, anh bán 30k ạ", "Chai nước này chỉ 10k...", "指出具体差价");
add("纪念品别卖这么贵", "Đồ lưu niệm đừng bán đắt thế ạ", "Đồ lưu niệm đừng bán đắt thế ạ", "纪念品防宰");
add("我在别处看到更便宜", "Em thấy chỗ khác rẻ hơn nhiều ạ", "Em thấy chỗ khác rẻ hơn nhiều ạ", "比价施压");
add("摩托车租借别收额外费用", "Thuê xe máy đừng tính phí phụ ạ", "Thuê xe máy đừng tính phí phụ ạ", "租摩托防加价");
add("我拍照了，会发到网上", "Em chụp ảnh rồi, sẽ đăng lên mạng ạ", "Em chụp ảnh rồi...", "照片证据威慑");
add("叫警察来处理", "Gọi công an đến giải quyết nhé", "Gọi công an đến giải quyết nhé", "叫警察");
add("我付这个价就走", "Em trả giá này rồi đi ạ", "Em trả giá này rồi đi ạ", "付完走人");
add("你这样我会给差评", "Anh/chị làm vậy em cho đánh giá xấu ạ", "Anh/chị làm vậy em cho đánh giá xấu ạ", "差评威慑");
add("餐厅账单不对", "Hóa đơn nhà hàng sai rồi ạ", "Hóa đơn nhà hàng sai rồi ạ", "指出账单错误");
add("KTV多收酒水费", "KTV tính thêm tiền rượu rồi ạ", "KTV tính thêm tiền rượu rồi ạ", "KTV常见宰客方式");
add("别逼我，我不怕", "Đừng ép em, em không sợ đâu ạ", "Đừng ép em...", "强硬态度");
add("这服务不值这个价", "Dịch vụ này không đáng giá này ạ", "Dịch vụ này không đáng giá này ạ", "指出服务不值");
add("你算错账了", "Anh/chị tính nhầm tiền rồi ạ", "Anh/chị tính nhầm tiền rồi ạ", "指出算错帐");
add("我只喝了这些，不该这么多", "Em chỉ uống những cái này, không đáng nhiều thế ạ", "Em chỉ uống những cái này...", "KTV/酒吧防宰");
add("我朋友上次来才一半价", "Bạn em lần trước chỉ trả nửa giá ạ", "Bạn em lần trước chỉ trả nửa giá ạ", "用前例施压");
add("别以为我不知道价格", "Đừng tưởng em không biết giá ạ", "Đừng tưởng em không biết giá ạ", "表明知道行情");
add("这多收的钱退回来", "Tiền tính thừa trả lại ạ", "Tiền tính thừa trả lại ạ", "要求退款");
add("我用MoMo付，不用现金", "Em trả qua MoMo, không dùng tiền mặt ạ", "Em trả qua MoMo...", "MoMo=越南支付软件，有记录");
add("你继续这样我叫经理", "Anh/chị tiếp tục vậy em gọi quản lý ạ", "Anh/chị tiếp tục vậy em gọi quản lý ạ", "叫经理");
add("这不是我们谈好的价", "Giá này không phải giá mình thỏa thuận ạ", "Giá này không phải giá mình thỏa thuận ạ", "指出违约价格");
add("我只付原价", "Em chỉ trả giá gốc thôi ạ", "Em chỉ trả giá gốc thôi ạ", "只付原价");
add("停车仔别收这么多", "Anh giữ xe đừng tính nhiều thế ạ", "Anh giữ xe đừng tính nhiều thế ạ", "停车费防宰");
add("海鲜别卖这么贵", "Hải sản đừng bán đắt thế ạ", "Hải sản đừng bán đắt thế ạ", "海鲜防宰");
add("我在超市看到更便宜", "Em thấy siêu thị bán rẻ hơn ạ", "Em thấy siêu thị bán rẻ hơn ạ", "超市比价");
add("别加服务费，我不接受", "Đừng tính phí dịch vụ, em không chấp nhận ạ", "Đừng tính phí dịch vụ...", "拒绝服务费");
add("账单给我看清楚", "Cho em xem hóa đơn rõ ràng ạ", "Cho em xem hóa đơn rõ ràng ạ", "要求看清楚账单");
add("这杯咖啡才20k，你卖50k", "Ly cà phê này chỉ 20k, anh bán 50k ạ", "Ly cà phê này chỉ 20k...", "咖啡防宰");
add("我付这个就走，不多给了", "Em trả cái này rồi đi, không cho thêm ạ", "Em trả cái này rồi đi...", "付完不加");
add("你这样我会发到TripAdvisor", "Anh/chị làm vậy em đăng lên TripAdvisor ạ", "Anh/chị làm vậy em đăng lên TripAdvisor ạ", "国际旅游平台差评威慑");
add("东西没那么值钱", "Đồ không đáng giá thế đâu ạ", "Đồ không đáng giá thế đâu ạ", "指出不值钱");
add("别再多算了", "Đừng tính thêm nữa ạ", "Đừng tính thêm nữa ạ", "拒绝多算");
add("我只坐到这里，不去远了", "Em chỉ đi tới đây thôi, không đi xa ạ", "Em chỉ đi tới đây thôi...", "出租车防绕路");
add("停车仔收的费太高", "Phí giữ xe cao quá ạ", "Phí giữ xe cao quá ạ", "停车费太高");
add("这不是我消费的", "Em không tiêu cái này ạ", "Em không tiêu cái này ạ", "否认消费项目");
add("请退回多收的钱", "Hoàn lại tiền thừa ạ", "Hoàn lại tiền thừa ạ", "要求退还");
add("你这样我会报警", "Anh/chị làm vậy em báo công an ạ", "Anh/chị làm vậy em báo công an ạ", "报警威慑");
add("我知道岘港物价", "Em biết giá Đà Nẵng ạ", "Em biết giá Đà Nẵng ạ", "表明了解物价");
add("别加夜间费", "Đừng tính phí đêm ạ", "Đừng tính phí đêm ạ", "拒绝夜间费");
add("这水果才5k一斤", "Trái cây này chỉ 5k một ký ạ", "Trái cây này chỉ 5k một ký ạ", "水果价格维权");
add("别卖假货给我", "Đừng bán hàng giả cho em ạ", "Đừng bán hàng giả cho em ạ", "拒绝假货");
add("我只付这个数", "Em chỉ trả số tiền này thôi ạ", "Em chỉ trả số tiền này thôi ạ", "只付固定金额");
add("餐厅别加服务费", "Nhà hàng đừng tính phí dịch vụ ạ", "Nhà hàng đừng tính phí dịch vụ ạ", "餐厅防加费");
add("出租车绕路了", "Taxi đi vòng rồi ạ", "Taxi đi vòng rồi ạ", "指出出租车绕路");
add("我不付绕路费", "Em không trả phí đi vòng ạ", "Em không trả phí đi vòng ạ", "拒绝付绕路费");
add("别以为我不会越南语", "Đừng nghĩ em không biết tiếng Việt ạ", "Đừng nghĩ em không biết tiếng Việt ạ", "表明会越南语");
add("给我正常价格", "Cho em giá bình thường ạ", "Cho em giá bình thường ạ", "要求正常价");
add("我要投诉到旅游局", "Em khiếu nại lên Sở Du lịch ạ", "Em khiếu nại lên Sở Du lịch ạ", "旅游局投诉，Sở Du lịch=旅游局");
add("这不是我同意的价格", "Giá này không phải em đồng ý ạ", "Giá này không phải em đồng ý ạ", "否认约定价格");
add("停车仔别收停车费", "Anh giữ xe đừng thu phí ạ", "Anh giữ xe đừng thu phí ạ", "拒绝收停车费");
add("海鲜别卖死货", "Hải sản đừng bán hàng chết ạ", "Hải sản đừng bán hàng chết ạ", "拒绝死海鲜");
add("给我正确账单", "Cho em hóa đơn đúng ạ", "Cho em hóa đơn đúng ạ", "要求正确账单");
add("别以为游客傻", "Đừng nghĩ du khách ngu ạ", "Đừng nghĩ du khách ngu ạ", "强硬表态");
add("这服务太差了", "Dịch vụ kém quá ạ", "Dịch vụ kém quá ạ", "指出服务差");
add("我要找你们老板", "Em muốn gặp chủ anh/chị ạ", "Em muốn gặp chủ anh/chị ạ", "找老板");
add("别加夜宵费", "Đừng tính phí khuya ạ", "Đừng tính phí khuya ạ", "拒绝夜宵费");
add("东西没那么贵", "Đồ không đắt thế đâu ạ", "Đồ không đắt thế đâu ạ", "指出不贵");
add("我不付额外费用", "Em không trả phí phụ ạ", "Em không trả phí phụ ạ", "拒绝额外费");
add("别骗外国人", "Đừng lừa người nước ngoài ạ", "Đừng lừa người nước ngoài ạ", "别骗外国人");
add("这账单我不同意", "Em không đồng ý hóa đơn này ạ", "Em không đồng ý hóa đơn này ạ", "否认账单");
add("东西质量不行", "Đồ chất lượng không ổn ạ", "Đồ chất lượng không ổn ạ", "质量不行");
add("别加小费了", "Đừng tính tip nữa ạ", "Đừng tính tip nữa ạ", "拒绝小费");
add("我只接受这个价", "Em chỉ chấp nhận giá này ạ", "Em chỉ chấp nhận giá này ạ", "只接受此价");

async function main() {
  console.log(`Seeding ${phrases.length} antiscam phrases...`);

  // Delete existing antiscam phrases
  const del = await prisma.scenePhrase.deleteMany({ where: { scene: "antiscam" } });
  console.log(`Deleted ${del.count} existing antiscam phrases`);

  // Create new phrases
  const result = await prisma.scenePhrase.createMany({ data: phrases });
  console.log(`Created ${result.count} antiscam phrases`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
