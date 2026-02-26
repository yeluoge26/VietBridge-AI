package com.vietbridge.ai.data.model

import java.util.UUID

// ── Chat message for UI ─────────────────────────────────────────────────

data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: MessageRole,
    val content: String,
    val responseType: String? = null,
    val data: ChatResponseData? = null,
    val warnings: List<ProactiveWarning>? = null,
) {
    enum class MessageRole { USER, ASSISTANT }

    companion object {
        fun user(text: String) = ChatMessage(role = MessageRole.USER, content = text)
        fun assistant(
            content: String,
            type: String? = null,
            data: ChatResponseData? = null,
            warnings: List<ProactiveWarning>? = null,
        ) = ChatMessage(role = MessageRole.ASSISTANT, content = content, responseType = type, data = data, warnings = warnings)
    }
}

// ── Learn data ──────────────────────────────────────────────────────────

data class DailyPhrase(
    val id: String,
    val vi: String,
    val zh: String,
    val pinyin: String,
    val scene: String,
) {
    companion object {
        val all = listOf(
            DailyPhrase("1", "Xin chào", "你好", "nǐ hǎo", "general"),
            DailyPhrase("2", "Cảm ơn", "谢谢", "xiè xiè", "general"),
            DailyPhrase("3", "Bao nhiêu tiền?", "多少钱？", "duō shǎo qián", "restaurant"),
            DailyPhrase("4", "Tôi không hiểu", "我听不懂", "wǒ tīng bù dǒng", "general"),
            DailyPhrase("5", "Cho tôi xem menu", "给我看菜单", "gěi wǒ kàn cài dān", "restaurant"),
            DailyPhrase("6", "Tính tiền", "买单", "mǎi dān", "restaurant"),
            DailyPhrase("7", "Đi đâu?", "去哪里？", "qù nǎ lǐ", "general"),
            DailyPhrase("8", "Tôi bị đau", "我不舒服", "wǒ bù shū fú", "hospital"),
            DailyPhrase("9", "Giá phòng bao nhiêu?", "房间多少钱？", "fáng jiān duō shǎo qián", "rent"),
            DailyPhrase("10", "Hẹn gặp lại", "再见", "zài jiàn", "general"),
            DailyPhrase("11", "Xin lỗi", "对不起", "duì bù qǐ", "general"),
            DailyPhrase("12", "Anh/Chị ơi", "服务员", "fú wù yuán", "restaurant"),
            DailyPhrase("13", "Tôi cần giúp đỡ", "我需要帮助", "wǒ xū yào bāng zhù", "general"),
        )
    }
}

data class SceneInfo(
    val id: String,
    val name: String,
    val icon: String,
    val description: String,
) {
    companion object {
        val all = listOf(
            SceneInfo("general", "日常", "chat", "日常交流"),
            SceneInfo("business", "商务", "business_center", "商业谈判"),
            SceneInfo("staff", "雇佣", "group", "员工管理"),
            SceneInfo("couple", "情侣", "favorite", "恋爱交流"),
            SceneInfo("restaurant", "餐饮", "restaurant", "点餐就餐"),
            SceneInfo("rent", "租房", "house", "租房看房"),
            SceneInfo("hospital", "就医", "local_hospital", "看病就医"),
            SceneInfo("repair", "维修", "build", "维修服务"),
        )
    }
}

enum class DocumentType(val label: String) {
    MENU("菜单"),
    RECEIPT("收据/小票"),
    CONTRACT("合同/文件"),
}

data class Plan(
    val id: String,
    val name: String,
    val price: String,
    val features: List<String>,
    val priceId: String? = null,
    val isCurrent: Boolean = false,
) {
    companion object {
        fun list(currentPlan: String) = listOf(
            Plan("free", "免费版", "¥0/月", listOf("每日10次对话", "基础翻译", "风险评估"), isCurrent = currentPlan == "FREE"),
            Plan("pro", "专业版", "¥49/月", listOf("无限对话", "GPT-4o模型", "OCR文档分析", "优先响应"), "price_pro_monthly", currentPlan == "PRO"),
            Plan("enterprise", "企业版", "¥199/月", listOf("团队共享", "API访问", "自定义模型", "专属客服"), "price_enterprise_monthly", currentPlan == "ENTERPRISE"),
        )
    }
}
