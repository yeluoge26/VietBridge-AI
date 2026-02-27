import Foundation

// MARK: - Request

struct ChatRequest: Encodable {
    let input: String
    let task: String
    let scene: String
    let tone: Int
    let stream: Bool
    let langDir: String
    var conversationId: String?
    var conversationHistory: [ConversationEntry]?
}

struct ConversationEntry: Encodable {
    let role: String   // "user" | "assistant"
    let content: String
}

// MARK: - SSE Events

struct SSEEvent: Decodable {
    let type: String            // "delta" | "done" | "error"
    let content: String?        // delta text chunk
    let messageType: String?    // "translation" | "reply" | "risk" | "teaching"
    let data: ChatResponseData?
    let intent: IntentInfo?
    let conversationId: String?
    let error: String?
    let proactiveWarnings: [ProactiveWarning]?
    let kbHits: [KBHit]?
    let hasContext: Bool?
}

struct IntentInfo: Codable {
    let task: String?
    let scene: String?
    let confidence: Double?
}

struct ProactiveWarning: Codable, Identifiable {
    var id: String { "\(type)-\(text.prefix(20))" }
    let type: String
    let text: String
}

// MARK: - KB Hits

struct KBHit: Codable, Identifiable {
    var id: String { source + String(confidence) }
    let source: String
    let detail: String
    let confidence: Double
}

// MARK: - Main Response Data (union of all task types)

struct ChatResponseData: Codable {
    // Translation fields
    let original: String?
    let translation: String?
    let natural: String?
    let tone: String?
    let scene: String?
    let context: String?
    let culture: String?
    let grammarNote: GrammarNote?

    // Reply fields
    let explanation: String?
    let emotion: String?
    let replies: [ReplyOption]?

    // Risk fields
    let score: Int?
    let situation: String?
    let factors: [RiskFactor]?
    let tips: [String]?
    let scripts: [RiskScript]?
    let knowledgeHits: [KBHit]?

    // Learn/Teaching fields
    let phrase: TeachPhrase?
    let examples: [TeachExample]?
}

// MARK: - Grammar Note (translation)

struct GrammarNote: Codable {
    let `self`: String?
    let other: String?
    let particles: [String]?
    let formality: String?

    enum CodingKeys: String, CodingKey {
        case `self`, other, particles, formality
    }

    var displayText: String {
        var parts: [String] = []
        if let s = self.`self` { parts.append("自称: \(s)") }
        if let o = other { parts.append("对方: \(o)") }
        if let p = particles, !p.isEmpty { parts.append("助词: \(p.joined(separator: ", "))") }
        if let f = formality { parts.append("语体: \(f)") }
        return parts.joined(separator: "；")
    }
}

// MARK: - Reply

struct ReplyOption: Codable, Identifiable {
    var id: String { "\(level ?? 0)-\(style)" }
    let level: Int?
    let style: String
    let text: String
    let zh: String?
}

// MARK: - Risk

struct RiskFactor: Codable, Identifiable {
    var id: String { label }
    let label: String
    let weight: Int
    let active: Bool?
}

struct RiskScript: Codable, Identifiable {
    var id: String { String(vi.prefix(30)) + String(zh.prefix(30)) }
    let vi: String
    let zh: String
}

// MARK: - Learn/Teaching

struct TeachPhrase: Codable {
    let vi: String?
    let zh: String?
    let pinyin: String?
}

struct TeachExample: Codable, Identifiable {
    var id: String { vi }
    let vi: String
    let zh: String
}

// MARK: - Message Types

enum MessageType: String {
    case user, assistant, streaming
}

struct ChatMessage: Identifiable {
    let id = UUID()
    let type: MessageType
    var text: String
    var responseType: String?       // "translation" | "reply" | "risk" | "teaching"
    var data: ChatResponseData?
    var proactiveWarnings: [ProactiveWarning]?
    var kbHits: [KBHit]?
}
