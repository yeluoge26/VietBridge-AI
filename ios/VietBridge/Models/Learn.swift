// ============================================================================
// VietBridge AI — Learn Models
// ============================================================================

import Foundation

struct DailyPhrase: Identifiable, Sendable {
    let id: String
    let vi: String
    let zh: String
    let pinyin: String
    let scene: String

    static let allPhrases: [DailyPhrase] = [
        DailyPhrase(id: "1", vi: "Xin chào", zh: "你好", pinyin: "nǐ hǎo", scene: "general"),
        DailyPhrase(id: "2", vi: "Cảm ơn", zh: "谢谢", pinyin: "xiè xiè", scene: "general"),
        DailyPhrase(id: "3", vi: "Bao nhiêu tiền?", zh: "多少钱？", pinyin: "duō shǎo qián", scene: "restaurant"),
        DailyPhrase(id: "4", vi: "Tôi không hiểu", zh: "我听不懂", pinyin: "wǒ tīng bù dǒng", scene: "general"),
        DailyPhrase(id: "5", vi: "Cho tôi xem menu", zh: "给我看菜单", pinyin: "gěi wǒ kàn cài dān", scene: "restaurant"),
        DailyPhrase(id: "6", vi: "Tính tiền", zh: "买单", pinyin: "mǎi dān", scene: "restaurant"),
        DailyPhrase(id: "7", vi: "Đi đâu?", zh: "去哪里？", pinyin: "qù nǎ lǐ", scene: "general"),
        DailyPhrase(id: "8", vi: "Tôi bị đau", zh: "我不舒服", pinyin: "wǒ bù shū fú", scene: "hospital"),
        DailyPhrase(id: "9", vi: "Giá phòng bao nhiêu?", zh: "房间多少钱？", pinyin: "fáng jiān duō shǎo qián", scene: "rent"),
        DailyPhrase(id: "10", vi: "Hẹn gặp lại", zh: "再见", pinyin: "zài jiàn", scene: "general"),
        DailyPhrase(id: "11", vi: "Xin lỗi", zh: "对不起", pinyin: "duì bù qǐ", scene: "general"),
        DailyPhrase(id: "12", vi: "Anh/Chị ơi", zh: "服务员", pinyin: "fú wù yuán", scene: "restaurant"),
        DailyPhrase(id: "13", vi: "Tôi cần giúp đỡ", zh: "我需要帮助", pinyin: "wǒ xū yào bāng zhù", scene: "general"),
    ]
}

struct SceneInfo: Identifiable, Sendable {
    let id: String
    let name: String
    let icon: String
    let description: String

    static let allScenes: [SceneInfo] = [
        SceneInfo(id: "general", name: "日常", icon: "bubble.left.and.bubble.right", description: "日常交流"),
        SceneInfo(id: "business", name: "商务", icon: "briefcase", description: "商业谈判"),
        SceneInfo(id: "staff", name: "雇佣", icon: "person.2", description: "员工管理"),
        SceneInfo(id: "couple", name: "情侣", icon: "heart", description: "恋爱交流"),
        SceneInfo(id: "restaurant", name: "餐饮", icon: "fork.knife", description: "点餐就餐"),
        SceneInfo(id: "rent", name: "租房", icon: "house", description: "租房看房"),
        SceneInfo(id: "hospital", name: "就医", icon: "cross.case", description: "看病就医"),
        SceneInfo(id: "repair", name: "维修", icon: "wrench.and.screwdriver", description: "维修服务"),
    ]
}
