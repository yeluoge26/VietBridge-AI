// ============================================================================
// VietBridge AI — Conversation Service
// CRUD for conversation history
// ============================================================================

import Foundation

struct ConversationService: Sendable {
    private let api = APIClient.shared

    func list(page: Int = 1, limit: Int = 20) async throws -> ConversationList {
        try await api.request(
            "GET",
            path: "/api/conversations",
            queryItems: [
                URLQueryItem(name: "page", value: String(page)),
                URLQueryItem(name: "limit", value: String(limit)),
            ]
        )
    }

    func get(id: String) async throws -> ConversationDetail {
        try await api.request("GET", path: "/api/conversations/\(id)")
    }

    func delete(id: String) async throws {
        try await api.requestVoid("DELETE", path: "/api/conversations/\(id)")
    }
}
