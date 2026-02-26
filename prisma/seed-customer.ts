// ============================================================================
// Seed script: Import customer/consumer scene phrases
// Run: npx tsx prisma/seed-customer.ts
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

function add(zh: string, vi: string, pinyin: string, culture: string) {
  phrases.push({ scene: "customer", zh, vi, pinyin, culture, sortOrder: order++ });
}

// table.csv — 购物砍价基础
add("这个多少钱？", "Cái này bao nhiêu tiền ạ?", "Cái này bao nhiêu tiền ạ?", "最常用问价句，任何地方都行");
add("太贵了，可以便宜点吗？", "Đắt quá, giảm giá được không ạ?", "Đắt quá, giảm giá được không ạ?", "砍价神句，岘港市场/街边摊超有效");
add("我买这个，可以再便宜一点吗？", "Em lấy cái này, bớt thêm chút được không ạ?", "Em lấy cái này, bớt thêm chút...", "决定买了再压价，成功率高");
add("有别的颜色/尺寸吗？", "Có màu khác / size khác không ạ?", "Có màu khác / size khác không ạ?", "买衣服、鞋子常用");
add("我要两个/三个", "Em lấy hai cái / ba cái ạ", "Em lấy hai cái / ba cái ạ", "买多件时直接说");
add("可以打包/给我袋子吗？", "Cho em túi đựng ạ / Cho em mang về ạ", "Cho em túi đựng ạ", "结账时必备");
add("这个坏了/有问题，能换一个吗？", "Cái này hỏng/hư rồi, đổi cái khác được không ạ?", "Cái này hỏng/hư rồi...", "买到次品时用");
add("谢谢，不用了", "Cảm ơn, em không lấy ạ", "Cảm ơn, em không lấy ạ", "不买时礼貌拒绝");

// table(1) — 酒店入住
add("我预订了房间，名字是...", "Em đã đặt phòng, tên là [Tên bạn] ạ", "Em đã đặt phòng, tên là...", "入住报名字");
add("几点退房？", "Giờ check-out là mấy giờ ạ?", "Giờ check-out là mấy giờ ạ?", "最常问的");
add("可以晚退房/延迟退房吗？", "Có thể late check-out được không ạ?", "Có thể late check-out được không ạ?", "想多睡一会儿时用");
add("WiFi密码是什么？", "Mật khẩu WiFi là gì ạ?", "Mật khẩu WiFi là gì ạ?", "几乎每家酒店必问");
add("空调坏了/没热水，能修一下吗？", "Máy lạnh hỏng / không có nước nóng, sửa được không ạ?", "Máy lạnh hỏng...", "房间问题投诉");
add("可以加床/加人吗？", "Có thể thêm giường / thêm người được không ạ?", "Có thể thêm giường...", "两人以上时用");
add("我要退房，请结账", "Em trả phòng ạ, tính tiền giúp em", "Em trả phòng ạ...", "退房结账");
add("早餐几点开始？", "Bữa sáng bắt đầu lúc mấy giờ ạ?", "Bữa sáng bắt đầu lúc mấy giờ ạ?", "酒店早餐必问");

// table(2) — 餐厅点菜
add("服务员！我想点菜", "Em ơi! Cho em gọi món ạ", "Em ơi! Cho em gọi món ạ", "叫服务员最常用");
add("菜单给我看看", "Cho em xem thực đơn ạ", "Cho em xem thực đơn ạ", "要菜单");
add("我要一份牛肉河粉", "Cho em một tô phở bò ạ", "Cho em một tô phở bò ạ", "岘港最经典点菜");
add("不辣/少辣/多辣", "Không cay / Ít cay / Nhiều cay ạ", "Không cay / Ít cay / Nhiều cay ạ", "越南菜辣度很重要");
add("打包带走", "Cho em mang về ạ", "Cho em mang về ạ", "吃不完打包");
add("结账/买单", "Tính tiền ạ / Thanh toán ạ", "Tính tiền ạ", "最常用结账句");
add("好吃！再来一份", "Ngon quá ạ! Cho em thêm một phần nữa", "Ngon quá ạ! Cho em thêm...", "夸奖+加点");
add("账单有问题", "Hóa đơn có sai sót ạ", "Hóa đơn có sai sót ạ", "发现多算钱时用");

// table(3) — 购物进阶
add("这个新鲜吗？", "Cái này tươi không ạ?", "Cái này tươi không ạ?", "");
add("能试穿吗？", "Có thể thử đồ được không ạ?", "Có thể thử đồ được không ạ?", "");
add("太大了/太小了，有别的尺寸吗？", "To quá / Nhỏ quá, có size khác không ạ?", "To quá / Nhỏ quá...", "");
add("质量好吗？耐穿吗？", "Chất lượng tốt không ạ? Có bền không ạ?", "Chất lượng tốt không ạ?", "");
add("我只要这个，不用包了", "Em chỉ lấy cái này thôi, không cần gói ạ", "Em chỉ lấy cái này thôi...", "");
add("可以开发票吗？", "Có thể xuất hóa đơn được không ạ?", "Có thể xuất hóa đơn được không ạ?", "");
add("东西太多了，能送我一个大袋子吗？", "Đồ nhiều quá, cho em túi to hơn được không ạ?", "Đồ nhiều quá...", "");
add("这个打折吗？买多有优惠吗？", "Cái này có giảm giá không ạ? Mua nhiều có ưu đãi không?", "Cái này có giảm giá không ạ?", "");
add("我在别家看到更便宜", "Em thấy chỗ khác bán rẻ hơn ạ", "Em thấy chỗ khác bán rẻ hơn ạ", "");
add("最后价是多少？", "Giá cuối cùng bao nhiêu ạ?", "Giá cuối cùng bao nhiêu ạ?", "");

// table(4) — 酒店进阶
add("房间有海景吗？", "Phòng có view biển không ạ?", "Phòng có view biển không ạ?", "");
add("可以换房间吗？", "Có thể đổi phòng được không ạ?", "Có thể đổi phòng được không ạ?", "");
add("房间没拖鞋/毛巾，能补吗？", "Phòng không có dép / khăn, bổ sung được không ạ?", "Phòng không có dép...", "");
add("几点有热水？", "Mấy giờ có nước nóng ạ?", "Mấy giờ có nước nóng ạ?", "");
add("电梯在哪里？", "Thang máy ở đâu ạ?", "Thang máy ở đâu ạ?", "");
add("可以寄存行李吗？", "Có thể gửi hành lý được không ạ?", "Có thể gửi hành lý được không ạ?", "");
add("早餐包括在房费里吗？", "Bữa sáng có trong giá phòng không ạ?", "Bữa sáng có trong giá phòng không ạ?", "");
add("我要续住一天", "Em muốn ở thêm một ngày ạ", "Em muốn ở thêm một ngày ạ", "");
add("房间太吵，能换安静点的吗？", "Phòng ồn quá, đổi phòng yên tĩnh hơn được không ạ?", "Phòng ồn quá...", "");
add("谢谢你们的热情服务", "Cảm ơn khách sạn phục vụ nhiệt tình ạ", "Cảm ơn khách sạn...", "");

// table(5) — 餐厅进阶
add("这个菜有什么配料？", "Món này có nguyên liệu gì ạ?", "Món này có nguyên liệu gì ạ?", "");
add("我吃素/不吃肉", "Em ăn chay / không ăn thịt ạ", "Em ăn chay / không ăn thịt ạ", "");
add("可以少油少盐吗？", "Có thể ít dầu / ít mặn được không ạ?", "Có thể ít dầu...", "");
add("这个菜快上吗？", "Món này lên nhanh không ạ?", "Món này lên nhanh không ạ?", "");
add("我要加冰/不要冰", "Cho em thêm đá / không đá ạ", "Cho em thêm đá...", "");
add("再加一瓶啤酒/一瓶水", "Cho em thêm một chai bia / nước ạ", "Cho em thêm một chai bia...", "");
add("菜太咸/太辣了", "Món này mặn quá / cay quá ạ", "Món này mặn quá...", "");
add("能分单吗？（分开结账）", "Có thể chia bill được không ạ?", "Có thể chia bill được không ạ?", "");
add("服务员，麻烦快一点", "Em ơi, nhanh lên giúp em ạ", "Em ơi, nhanh lên giúp em ạ", "");
add("谢谢，很好吃", "Cảm ơn, ngon lắm ạ", "Cảm ơn, ngon lắm ạ", "");

// table(6) — 砍价/市场
add("这个可以讲价吗？", "Cái này mặc cả được không ạ?", "Cái này mặc cả được không ạ?", "");
add("我是本地人/游客，能便宜点吗？", "Em là người địa phương / du khách, giảm chút được không ạ?", "Em là người địa phương...", "");
add("这个看起来不新鲜", "Cái này trông không tươi ạ", "Cái này trông không tươi ạ", "");
add("有折扣/促销吗？", "Có khuyến mãi / giảm giá không ạ?", "Có khuyến mãi...", "");
add("买一送一吗？", "Mua một tặng một không ạ?", "Mua một tặng một không ạ?", "");
add("这个多少钱一斤？", "Cái này bao nhiêu một ký ạ?", "Cái này bao nhiêu một ký ạ?", "");
add("我只要半斤", "Em lấy nửa ký thôi ạ", "Em lấy nửa ký thôi ạ", "");
add("帮我挑新鲜的", "Chọn giúp em cái tươi nhé ạ", "Chọn giúp em cái tươi nhé ạ", "");
add("不要这个，有别的吗？", "Không lấy cái này, có cái khác không ạ?", "Không lấy cái này...", "");
add("太丑了/不好看", "Xấu quá / Không đẹp ạ", "Xấu quá / Không đẹp ạ", "");

// table(7) — 酒店补充
add("房间有阳台吗？", "Phòng có ban công không ạ?", "Phòng có ban công không ạ?", "");
add("可以加早餐吗？", "Có thể thêm bữa sáng được không ạ?", "Có thể thêm bữa sáng được không ạ?", "");
add("房间太热/太冷，能调空调吗？", "Phòng nóng quá / lạnh quá, chỉnh máy lạnh được không ạ?", "Phòng nóng quá...", "");
add("插座在哪里？", "Ổ cắm điện ở đâu ạ?", "Ổ cắm điện ở đâu ạ?", "");
add("有吹风机吗？", "Có máy sấy tóc không ạ?", "Có máy sấy tóc không ạ?", "");
add("可以叫早起服务吗？几点？", "Có gọi dậy sớm được không ạ? Mấy giờ ạ?", "Có gọi dậy sớm được không ạ?", "");
add("房间有蚊子，能给驱蚊剂吗？", "Phòng có muỗi, cho em thuốc chống muỗi được không ạ?", "Phòng có muỗi...", "");
add("钥匙卡坏了，能换一张吗？", "Thẻ khóa hỏng rồi, đổi cái mới được không ạ?", "Thẻ khóa hỏng rồi...", "");
add("我要加一晚", "Em muốn ở thêm một đêm ạ", "Em muốn ở thêm một đêm ạ", "");
add("酒店有泳池/健身房吗？", "Khách sạn có hồ bơi / phòng gym không ạ?", "Khách sạn có hồ bơi...", "");

// table(8) — 餐厅补充
add("这个菜辣吗？", "Món này cay không ạ?", "Món này cay không ạ?", "");
add("我对海鲜过敏", "Em bị dị ứng hải sản ạ", "Em bị dị ứng hải sản ạ", "");
add("能快点上菜吗？我们赶时间", "Có thể lên món nhanh được không ạ? Chúng em đang vội", "Có thể lên món nhanh được không ạ?", "");
add("这个是本地特色吗？", "Món này là đặc sản địa phương phải không ạ?", "Món này là đặc sản địa phương phải không ạ?", "");
add("再加一份米饭/面包", "Cho em thêm một phần cơm / bánh mì ạ", "Cho em thêm một phần cơm...", "");
add("饮料可以换成热的吗？", "Đồ uống đổi sang nóng được không ạ?", "Đồ uống đổi sang nóng được không ạ?", "");
add("菜有点腥，能加姜/柠檬吗？", "Món này hơi tanh, cho thêm gừng / chanh được không ạ?", "Món này hơi tanh...", "");
add("结账时分开付吗？", "Khi tính tiền chia ra được không ạ?", "Khi tính tiền chia ra được không ạ?", "");
add("服务员，麻烦加水", "Em ơi, thêm nước lọc giúp em ạ", "Em ơi, thêm nước lọc giúp em ạ", "");
add("味道很好，下次还来", "Ngon lắm ạ, lần sau em quay lại", "Ngon lắm ạ, lần sau em quay lại", "");

async function main() {
  console.log(`Seeding ${phrases.length} customer scene phrases...`);

  const deleted = await prisma.scenePhrase.deleteMany({
    where: { scene: "customer" },
  });
  console.log(`Deleted ${deleted.count} existing customer phrases`);

  const result = await prisma.scenePhrase.createMany({
    data: phrases.map((p) => ({
      scene: p.scene,
      zh: p.zh,
      vi: p.vi,
      pinyin: p.pinyin,
      culture: p.culture,
      sortOrder: p.sortOrder,
      active: true,
    })),
  });

  console.log(`Created ${result.count} customer scene phrases.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
