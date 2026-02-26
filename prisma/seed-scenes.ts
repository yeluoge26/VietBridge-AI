// ============================================================================
// Seed script: Import scene phrases from CSV data into ScenePhrase table
// Run: npx tsx prisma/seed-scenes.ts
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

function add(scene: string, zh: string, vi: string, pinyin: string, culture: string) {
  phrases.push({ scene, zh, vi, pinyin, culture, sortOrder: order++ });
}

// ============================================================================
// KTV 夜生活
// ============================================================================

// table(1) — 出台暗示
add("ktv", "今晚出去玩一下好吗？", "Tối nay ra ngoài chơi một chút nhé em?", "Tối nay ra ngoài chơi một chút nhé em?", "最经典的\"出台\"暗示，几乎所有人都懂\"ra ngoài\"=开房/出去继续玩");
add("ktv", "我们去吃宵夜/续摊吧？", "Mình đi ăn khuya / đi tiếp nhé?", "Mình đi ăn khuya đi tiếp nhé?", "表面是续摊吃夜宵，实际暗示想带出去");
add("ktv", "想换个地方聊聊吗？", "Muốn đổi chỗ nói chuyện riêng không em?", "Muốn đổi chỗ nói chuyện riêng không em?", "暗示想去私密地方（酒店/家）");
add("ktv", "房间里更舒服，要不要去？", "Phòng kia thoải mái hơn, đi không em?", "Phòng kia thoải mái hơn, đi không em?", "直接点，但仍算委婉（常在包厢里说）");
add("ktv", "今晚陪我到天亮好不好？", "Đêm nay ở với anh tới sáng nhé?", "Đêm nay ở với anh tới sáng nhé?", "包夜暗示，很常见");

// table(2) — 服务协商
add("ktv", "有\"特别服务\"吗？", "Có dịch vụ đặc biệt không em?", "Có dịch vụ đặc biệt không em?", "\"dịch vụ đặc biệt\"=性服务，几乎是行业黑话");
add("ktv", "可以玩得开心一点吗？", "Chơi vui vẻ hơn được không?", "Chơi vui vẻ hơn được không?", "暗示想超出唱歌喝酒的范围");
add("ktv", "除了唱歌喝酒，还能做什么？", "Ngoài hát với nhậu, còn làm gì nữa em?", "Ngoài hát với nhậu, còn làm gì nữa em?", "试探底线，很自然");
add("ktv", "多少钱可以更亲近一点？", "Bao nhiêu thì thân mật hơn được em?", "Bao nhiêu thì thân mật hơn được em?", "问价格时最委婉的方式之一");
add("ktv", "可以摸一下/抱一下吗？", "Cho anh ôm / sờ một chút được không?", "Cho anh ôm / sờ một chút được không?", "从轻度肢体接触开始试探");

// table(3) — 调情升级
add("ktv", "你好香啊，靠近点闻闻", "Em thơm quá, lại gần anh ngửi chút đi", "Em thơm quá, lại gần anh ngửi chút đi", "借口靠近 + 肢体接触");
add("ktv", "你穿这样真诱人", "Em mặc thế này sexy quá", "Em mặc thế này sexy quá", "夸性感，引出下一步");
add("ktv", "坐近点，哥哥想好好看你", "Ngồi gần anh chút đi, anh muốn ngắm em", "Ngồi gần anh chút đi...", "让对方主动靠近");
add("ktv", "你笑起来好迷人，想亲一下", "Em cười dễ thương quá, hôn cái được không?", "Em cười dễ thương quá, hôn cái được không?", "从亲吻开始升级");
add("ktv", "手好软，握着不放了", "Tay em mềm quá, anh nắm mãi không buông", "Tay em mềm quá...", "牵手/摸手过渡");

// table(4) — 加钟小费
add("ktv", "再加一小时/再续一钟好吗？", "Gia thêm một tiếng nữa nhé em?", "Gia thêm một tiếng nữa nhé em?", "加钟最常用说法");
add("ktv", "多给点小费，可以多陪陪我吗？", "Tip thêm chút nữa, em ở với anh lâu hơn nhé?", "Tip thêm chút nữa...", "用小费换更长时间/更亲密服务");
add("ktv", "今天开心，多给点行吗？", "Hôm nay vui quá, cho anh tip thêm nhé?", "Hôm nay vui quá, cho anh tip thêm nhé?", "事后/过程中求加钱");

// table(5) — 女孩拒绝话术
add("ktv", "人家今晚不舒服/来那个了", "Hôm nay em không khỏe / đang \"đến ngày\"", "Hôm nay em không khỏe...", "最常见借口，客人通常不好再强求");
add("ktv", "只能陪唱歌喝酒哦", "Em chỉ hát với nhậu thôi anh ơi", "Em chỉ hát với nhậu thôi anh ơi", "明确划清界限");
add("ktv", "店里有规定，不能出去", "Quán quy định không cho ra ngoài anh", "Quán quy định không cho ra ngoài anh", "把责任推给店规");
add("ktv", "下次吧，今天不行", "Lần sau nhé anh, hôm nay không được", "Lần sau nhé anh...", "拖延 + 留后路");
add("ktv", "人家害羞啦", "Em ngại lắm anh ơi", "Em ngại lắm anh ơi", "撒娇式拒绝，软化气氛");

// ============================================================================
// 吵架骂人
// ============================================================================

// table.csv — 基础脏话/缩写
add("dirtyword", "太他妈了 / 吓尿了 / 牛逼爆了", "vcl / vl / vãi / vãi chưởng lồn", "vcl / vl / vãi", "最高频，TikTok/Threads到处都是，2025-2026万能词");
add("dirtyword", "操你妈的怎么这样", "đmmt / địt mẹ mày thế", "đmmt", "气急败坏时用，battle常见");
add("dirtyword", "操你妈", "cmm / cmnr / con mẹ mày", "cmm / cmnr", "网络聊天最狠缩写");
add("dirtyword", "错得离谱 / 傻逼了", "sml / sai mẹ lầm", "sml", "自嘲或骂别人错大");
add("dirtyword", "妈的变体（轻骂）", "cđm / cái đ*m mẹ", "cđm", "日常吐槽");

// table(1) — 骂人词
add("dirtyword", "蠢爆了 / 傻逼", "ngu vcl / ngu như bò", "ngu vcl", "高频，游戏/辩论区常用");
add("dirtyword", "没教养 / 贱", "mất dạy / con mất dạy", "mất dạy", "北方人更爱用");
add("dirtyword", "神经病 / 疯了", "điên à? / khùng à?", "điên à? / khùng à?", "朋友互怼常见");
add("dirtyword", "废物 / 垃圾", "đồ bỏ đi / đồ vô dụng", "đồ bỏ đi", "狠毒diss");
add("dirtyword", "贱人 / 不要脸", "con cave / con đĩ", "con cave", "骂女生多");

// table(2) — 网络梗/流行语
add("dirtyword", "输了人生 / 赢了人生（自嘲/炫耀）", "thua đời / thắng đời", "thua đời / thắng đời", "Tết 2025 viral，TikTok热梗");
add("dirtyword", "玩世不恭一代（自嘲Gen Z）", "thế hệ cợt nhả", "thế hệ cợt nhả", "2025 slang，FB/Threads");
add("dirtyword", "备胎 / 备用轮胎", "lốp trưởng / lốp dự phòng", "lốp trưởng", "感情battle梗，2025火");
add("dirtyword", "妄想 / 脑残（借英语）", "delulu / skibidi", "delulu / skibidi", "TikTok英越mix，2025-2026");
add("dirtyword", "煮火锅？（实际骂人狠毒）", "nấu xói", "nấu xói", "2025新毒舌梗");

// table(3) — 对线/battle句型
add("dirtyword", "操你妈的垃圾", "ĐM đồ bỏ đi / Cmm đồ bỏ đi", "ĐM đồ bỏ đi", "FB/Threads/TikTok，高强度");
add("dirtyword", "你蠢爆了，滚蛋", "Ngu vcl, cút mẹ mày đi", "Ngu vcl, cút mẹ mày đi", "评论区开喷标配");
add("dirtyword", "你妈的怎么这么low", "Đmmt low vcl / Đù má low thế", "Đmmt low vcl", "阴阳怪气diss");
add("dirtyword", "输不起就别玩", "Thua thì đừng chơi / Thua mẹ rồi", "Thua mẹ rồi", "辩论/撕逼结尾");
add("dirtyword", "键盘侠闭嘴", "Bàn phím chiến binh im đi / Keyboard warrior câm mồm", "Keyboard warrior", "怼喷子经典");
add("dirtyword", "删号吧你", "Xóa acc đi / Delete acc mẹ mày", "Xóa acc đi", "游戏+网络混用");

// table(4) — 游戏喷人
add("dirtyword", "菜鸡 / 坑货", "Gà / Gà mờ / Gà vcl", "Gà vcl", "Liên Quân/Free Fire，高频");
add("dirtyword", "去死吧，坑队友", "Chết mẹ mày đi, feed team", "Chết mẹ mày đi", "输了就喷");
add("dirtyword", "你妈的挂逼", "ĐM hack / Đù má hack vcl", "ĐM hack", "PUBG/Valorant常见");
add("dirtyword", "傻逼别指挥", "Ngu vcl đừng chỉ huy", "Ngu vcl", "语音房battle");
add("dirtyword", "队友是猪", "Team như heo / Đồng đội như lợn", "Team như heo", "甩锅神句");
add("dirtyword", "别BB，闭嘴玩", "Đừng bb, câm mồm chơi đi", "Đừng bb", "烦队友时用");
add("dirtyword", "举报你全家", "Report cả nhà mày / Report mẹ mày", "Report mẹ mày", "挂逼/喷子终极句");

// ============================================================================
// 交通摩托
// ============================================================================

// table.csv — 交警应对
add("transport", "警察叔叔好，我停这里可以吗？", "Chào anh công an, em dừng ở đây được không ạ?", "Chào anh công an, em dừng ở đây được không ạ?", "礼貌问，先打招呼最安全");
add("transport", "您好，请问有什么问题吗？", "Xin chào, có vấn đề gì ạ?", "Xin chào, có vấn đề gì ạ?", "标准回应，被拦时先说这个");
add("transport", "我没有看到红灯，对不起", "Em không thấy đèn đỏ, xin lỗi anh ạ", "Em không thấy đèn đỏ, xin lỗi anh ạ", "承认错误 + 道歉，罚款可能减半");
add("transport", "我可以看一下罚单吗？", "Em xem biên bản được không ạ?", "Em xem biên bản được không ạ?", "要求查看罚单（越南交警必须出示）");
add("transport", "可以少罚一点吗？我第一次犯错", "Có thể giảm phạt chút được không ạ? Em vi phạm lần đầu", "Có thể giảm phạt chút được không ạ?", "轻微求情，岘港交警有时会网开一面（别太强求）");
add("transport", "我是外国人/游客，不太懂交通规则", "Em là người nước ngoài / du khách, chưa quen luật giao thông", "Em là người nước ngoài...", "外国人常用借口，有时有效，但别滥用");
add("transport", "罚多少钱？可以现场交吗？", "Phạt bao nhiêu tiền ạ? Có nộp tại chỗ được không?", "Phạt bao nhiêu tiền ạ?", "问金额和是否现场缴（很多地方可现场缴现金/转账）");
add("transport", "谢谢警察叔叔，我下次注意", "Cảm ơn anh công an, lần sau em sẽ chú ý ạ", "Cảm ơn anh công an...", "结束时礼貌道谢，留下好印象");

// table(1) — 停车
add("transport", "这里可以停车吗？", "Chỗ này đỗ xe được không ạ?", "Chỗ này đỗ xe được không ạ?", "先问再停，避免罚单");
add("transport", "我停一会儿就走，可以吗？", "Em đỗ một chút rồi đi ngay, được không ạ?", "Em đỗ một chút rồi đi ngay...", "求情短暂停放");
add("transport", "停车费多少钱？", "Phí gửi xe bao nhiêu ạ?", "Phí gửi xe bao nhiêu ạ?", "正规停车场或路边停车仔问");
add("transport", "我的摩托车被罚了？多少钱？", "Xe em bị phạt hả anh? Bao nhiêu tiền ạ?", "Xe em bị phạt hả anh?...", "被贴条后询问");
add("transport", "可以不贴条吗？我马上开走", "Có thể không dán biên bản không ạ? Em đi ngay đây", "Có thể không dán biên bản không ạ?", "求情快速离开（成功率看运气）");
add("transport", "停车小哥，帮我看车好吗？", "Anh giữ xe giúp em nhé, em đi một chút thôi", "Anh giữ xe giúp em nhé...", "路边停车仔常见，付5-10k VND");
add("transport", "车被拖走了，怎么办？", "Xe em bị kéo rồi, phải làm sao ạ?", "Xe em bị kéo rồi...", "问拖车场位置和取车手续");

// table(2) — 问路
add("transport", "请问美溪海滩怎么走？", "Xin hỏi đường đến biển Mỹ Khê đi hướng nào ạ?", "Xin hỏi đường đến biển Mỹ Khê...", "岘港最常问路");
add("transport", "去龙桥要走哪条路？", "Đi Cầu Rồng thì đi đường nào ạ?", "Đi Cầu Rồng thì đi đường nào ạ?", "汉江龙桥方向");
add("transport", "我可以在这里掉头吗？", "Em quay đầu xe ở đây được không ạ?", "Em quay đầu xe ở đây được không ạ?", "岘港很多地方禁掉头，先问");
add("transport", "前面有交警检查吗？", "Phía trước có công an kiểm tra không anh/chị ơi?", "Phía trước có công an...", "骑摩托车党常用\"探路\"");
add("transport", "谢谢，我知道了", "Cảm ơn, em biết rồi ạ", "Cảm ơn, em biết rồi ạ", "礼貌结束对话");

// ============================================================================
// 情侣亲密
// ============================================================================

// table.csv — 亲密用语
add("mlove", "再深一点，吸紧点", "Bú sâu thêm đi em, siết chặt nữa", "Bú sâu thêm đi em, siết chặt nữa", "");
add("mlove", "你的屁股好翘，转过来让我看", "Mông em cong quá, quay lại cho anh xem", "Mông em cong quá, quay lại cho anh xem", "");
add("mlove", "夹紧点，我快射了", "Siết chặt đi em, anh sắp ra rồi", "Siết chặt đi em, anh sắp ra rồi", "");
add("mlove", "换个姿势，我要从上面", "Đổi kiểu đi, anh muốn nằm trên", "Đổi kiểu đi, anh muốn nằm trên", "");
add("mlove", "快点骑我，动起来", "Nhanh lên cưỡi anh đi, nhún mạnh lên", "Nhanh lên cưỡi anh đi, nhún mạnh lên", "");
add("mlove", "再来一发，我还没满足", "Làm thêm phát nữa đi, anh chưa đã", "Làm thêm phát nữa đi, anh chưa đã", "");
add("mlove", "我硬得发疼，快帮我", "Anh cứng đau quá, giúp anh đi em", "Anh cứng đau quá, giúp anh đi em", "");
add("mlove", "你湿透了，是不是很想要？", "Em ướt nhẹp rồi, có phải thèm lắm không?", "Em ướt nhẹp rồi, có phải thèm lắm không?", "");

// table1.csv — KTV/交易场景
add("mlove", "今晚陪我整晚吧", "Em ngồi với anh cái đêm nay luôn đi", "Em ngồi với anh cái đêm nay luôn đi", "");
add("mlove", "全套服务多少钱？", "Full service bao nhiêu em?", "Full se-vích bao nhiêu em?", "");
add("mlove", "今晚包你一晚多少钱？", "Bao em hết đêm nay bao nhiêu?", "Bao em hết đêm nay bao nhiêu?", "");
add("mlove", "下面好紧啊", "Lồn em khít quá", "Lồn em khít quá", "");
add("mlove", "操得你爽不爽？", "Địt em sướng không? / Địt em phê chưa?", "Địt em sướng không?", "");
add("mlove", "转过去，我从后面来", "Quay đít lại anh địt cho / Doggy đi em", "Quay đít lại anh địt cho", "");
add("mlove", "奶子好大，给我吸", "Vú em to quá, cho anh bú", "Vú em to quá, cho anh bú", "");
add("mlove", "再叫大声点，骚一点", "Rên to lên em, rên dâm đi", "Rên to lên em, rên dâm đi", "");
add("mlove", "快点动屁股", "Nhún mạnh lên em / Cưỡi anh đi", "Nhún mạnh lên em", "");
add("mlove", "只玩嘴/手，不插可以吗？", "Chơi nhẹ thôi em, bú hoặc sờ thôi nhé", "Chơi nhẹ thôi em", "");
add("mlove", "你技术真好", "Em bú giỏi quá, phê vãi luôn", "Em bú giỏi quá, phê vãi", "");
add("mlove", "再来一次，我还没够", "Làm thêm phát nữa đi, anh chưa đã", "Làm thêm phát nữa đi", "");
add("mlove", "亲嘴，来舌吻", "Hôn cái đi, hôn kiểu Pháp luôn", "Hôn kiểu Pháp luôn", "");

// table(1) — 更多亲密表达
add("mlove", "再用力点，我要高潮了", "Địt mạnh nữa đi em, anh sắp ra rồi", "Địt mạnh nữa đi em, anh sắp ra rồi", "");
add("mlove", "转过来，让我从后面", "Quay lại đi, anh địt từ sau mạnh tay", "Quay lại đi, anh địt từ sau mạnh tay", "");
add("mlove", "你的奶子晃得好诱人", "Vú em lắc ngon quá, bóp đã tay vcl", "Vú em lắc ngon quá, bóp đã tay vcl", "");
add("mlove", "你下面好紧，干起来真带劲", "Lồn em khít quá, địt đã vcl", "Lồn em khít quá, địt đã vcl", "");
add("mlove", "快骑我，用力动屁股", "Nhanh cưỡi anh đi, nhún mông mạnh lên", "Nhanh cưỡi anh đi, nhún mông mạnh lên", "");
add("mlove", "我硬得发疼，快帮我含住", "Anh cứng đau quá, ngậm cu anh đi rồi bắn ra", "Anh cứng đau quá, ngậm cu anh đi rồi bắn ra", "");

// table11.csv — 补充
add("mlove", "你的小穴好会吸，夹得我腿软了", "Lồn em hút giỏi vcl, siết anh tê chân luôn", "Lồn em hút giỏi vcl, siết anh tê chân luôn", "");
add("mlove", "再来一轮，我要干到天亮", "Làm thêm phát nữa đi, anh muốn địt tới sáng", "Làm thêm phát nữa đi, anh muốn địt tới sáng", "");

async function main() {
  console.log(`Seeding ${phrases.length} scene phrases...`);

  // Delete existing phrases for these 4 scenes
  const scenes = ["ktv", "dirtyword", "transport", "mlove"];
  const deleted = await prisma.scenePhrase.deleteMany({
    where: { scene: { in: scenes } },
  });
  console.log(`Deleted ${deleted.count} existing phrases for scenes: ${scenes.join(", ")}`);

  // Insert all phrases
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

  console.log(`Created ${result.count} scene phrases.`);

  // Show counts per scene
  for (const s of scenes) {
    const count = phrases.filter((p) => p.scene === s).length;
    console.log(`  ${s}: ${count} phrases`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
