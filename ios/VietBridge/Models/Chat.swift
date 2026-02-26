// ============================================================================
// VietBridge AI — Chat Models
// Codable structs matching backend JSON responses
// ============================================================================

import Foundation

// MARK: - Chat Request

struct ChatRequest: Codable, Sendable {
    let input: String
    let task: String?
    let scene: String?
    let langDir: String
    let tone: Int
    let stream: Bool
    let conversationId: String?
    let conversationHistory: [HistoryMessage]
}

struct HistoryMessage: Codable, Sendable {
    let role: String
    let content: String
}

// MARK: - SSE Events

struct SSEDeltaEvent: Codable, Sendable {
    let type: String
    let content: String?
}

struct SSEDoneEvent: Codable, Sendable {
    let type: String
    let messageType: String?
    let data: ChatResponseData?
    let proactiveWarnings: [ProactiveWarning]?
    let conversationId: String?
    let intent: IntentInfo?
    let usage: UsageInfo?
}

struct IntentInfo: Codable, Sendable {
    let task: String
    let scene: String
    let confidence: Double
}

struct UsageInfo: Codable, Sendable {
    let model: String
    let tokensPrompt: Int
    let tokensCompletion: Int
    let cost: String
    let latency: Int
}

// MARK: - Chat Response Data

enum ChatResponseData: Codable, Sendable {
    case translation(TranslationData)
    case reply(ReplyData)
    case risk(RiskData)
    case teach(TeachData)
    case unknown

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let t = try? container.decode(TranslationData.self), t.translation != nil {
            self = .translation(t)
        } else if let r = try? container.decode(ReplyData.self), r.replies != nil {
            self = .reply(r)
        } else if let rk = try? container.decode(RiskData.self), rk.score != nil {
            self = .risk(rk)
        } else if let tc = try? container.decode(TeachData.self), tc.phrase != nil {
            self = .teach(tc)
        } else {
            self = .unknown
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .translation(let d): try container.encode(d)
        case .reply(let d): try container.encode(d)
        case .risk(let d): try container.encode(d)
        case .teach(let d): try container.encode(d)
        case .unknown: try container.encodeNil()
        }
    }
}

// MARK: - Translation

struct TranslationData: Codable, Sendable {
    let translation: String?
    let pinyin: String?
    let literal: String?
    let context: String?
    let alternatives: [AlternativeTranslation]?
}

struct AlternativeTranslation: Codable, Sendable {
    let text: String
    let tone: String?
    let note: String?
}

// MARK: - Reply

struct ReplyData: Codable, Sendable {
    let replies: [ReplyOption]?
    let culturalNote: String?
}

struct ReplyOption: Codable, Sendable, Identifiable {
    var id: String { text }
    let text: String
    let tone: String?
    let pinyin: String?
    let translation: String?
}

// MARK: - Risk

struct RiskData: Codable, Sendable {
    let score: Int?
    let level: String?
    let factors: [RiskFactor]?
    let tips: [String]?
    let scripts: [RiskScript]?
}

struct RiskFactor: Codable, Sendable, Identifiable {
    var id: String { label }
    let label: String
    let detail: String?
    let weight: Int?
}

struct RiskScript: Codable, Sendable, Identifiable {
    var id: String { vi }
    let vi: String
    let zh: String
    let situation: String?
}

// MARK: - Teach

struct TeachData: Codable, Sendable {
    let phrase: String?
    let pinyin: String?
    let meaning: String?
    let examples: [TeachExample]?
    let culturalNote: String?
}

struct TeachExample: Codable, Sendable, Identifiable {
    var id: String { vi }
    let vi: String
    let zh: String
    let situation: String?
}

// MARK: - Proactive Warning

struct ProactiveWarning: Codable, Sendable, Identifiable {
    var id: String { message }
    let type: String
    let message: String
    let severity: String?
}

// MARK: - Chat Message (UI)

struct ChatMessage: Identifiable, Sendable {
    let id: String
    let role: MessageRole
    let content: String
    let responseType: String?
    let data: ChatResponseData?
    let proactiveWarnings: [ProactiveWarning]?
    let timestamp: Date

    enum MessageRole: String, Sendable {
        case user
        case assistant
    }

    static func user(_ text: String) -> ChatMessage {
        ChatMessage(
            id: UUID().uuidString,
            role: .user,
            content: text,
            responseType: nil,
            data: nil,
            proactiveWarnings: nil,
            timestamp: Date()
        )
    }

    static func assistant(
        content: String,
        type: String?,
        data: ChatResponseData?,
        warnings: [ProactiveWarning]?
    ) -> ChatMessage {
        ChatMessage(
            id: UUID().uuidString,
            role: .assistant,
            content: content,
            responseType: type,
            data: data,
            proactiveWarnings: warnings,
            timestamp: Date()
        )
    }
}
