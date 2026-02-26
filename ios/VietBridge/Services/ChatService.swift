// ============================================================================
// VietBridge AI — Chat Service
// Handles chat API calls with streaming support
// ============================================================================

import Foundation

struct ChatService: Sendable {
    private let api = APIClient.shared

    /// Send a chat message with SSE streaming
    func sendStreaming(
        input: String,
        task: String?,
        scene: String?,
        langDir: String,
        tone: Int,
        conversationId: String?,
        history: [HistoryMessage]
    ) async throws -> URLSession.AsyncBytes {
        let request = ChatRequest(
            input: input,
            task: task,
            scene: scene,
            langDir: langDir,
            tone: tone,
            stream: true,
            conversationId: conversationId,
            conversationHistory: history
        )
        return try await api.streamRequest(path: "/api/chat", body: request)
    }
}
