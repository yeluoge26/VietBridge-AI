// ============================================================================
// VietBridge AI — Subscription Models
// ============================================================================

import Foundation

struct UsageData: Codable, Sendable {
    let used: Int
    let limit: Int
    let allowed: Bool
    let plan: String
}

struct SubscriptionData: Codable, Sendable {
    let plan: String
    let stripeCustomerId: String?
    let stripeSubscriptionId: String?
    let currentPeriodEnd: String?
    let createdAt: String?
}

struct Plan: Identifiable, Sendable {
    let id: String
    let name: String
    let price: String
    let features: [String]
    let priceId: String?
    let isCurrent: Bool

    static func plans(currentPlan: String) -> [Plan] {
        [
            Plan(
                id: "free",
                name: "免费版",
                price: "¥0/月",
                features: ["每日10次对话", "基础翻译", "风险评估"],
                priceId: nil,
                isCurrent: currentPlan == "FREE"
            ),
            Plan(
                id: "pro",
                name: "专业版",
                price: "¥49/月",
                features: ["无限对话", "GPT-4o模型", "OCR文档分析", "优先响应"],
                priceId: "price_pro_monthly",
                isCurrent: currentPlan == "PRO"
            ),
            Plan(
                id: "enterprise",
                name: "企业版",
                price: "¥199/月",
                features: ["团队共享", "API访问", "自定义模型", "专属客服"],
                priceId: "price_enterprise_monthly",
                isCurrent: currentPlan == "ENTERPRISE"
            ),
        ]
    }
}
