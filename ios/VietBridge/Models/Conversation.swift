// ============================================================================
// VietBridge AI — Conversation Models
// ============================================================================

import Foundation

struct Conversation: Codable, Identifiable, Sendable {
    let id: String
    let userId: String
    let taskType: String
    let sceneType: String
    let title: String?
    let createdAt: String
    let updatedAt: String
    let count: MessageCount?

    enum CodingKeys: String, CodingKey {
        case id, userId, taskType, sceneType, title, createdAt, updatedAt
        case count = "_count"
    }
}

struct MessageCount: Codable, Sendable {
    let messages: Int
}

struct ConversationList: Codable, Sendable {
    let conversations: [Conversation]
    let total: Int
    let page: Int
    let totalPages: Int
}

struct ConversationDetail: Codable, Sendable {
    let id: String
    let taskType: String
    let sceneType: String
    let title: String?
    let messages: [ServerMessage]
}

struct ServerMessage: Codable, Identifiable, Sendable {
    let id: String
    let role: String
    let content: String
    let createdAt: String
}
