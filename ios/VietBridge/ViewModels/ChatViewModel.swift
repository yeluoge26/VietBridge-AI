// ============================================================================
// VietBridge AI — Chat View Model
// Manages messages, streaming, task/scene/tone state
// ============================================================================

import SwiftUI

@Observable
@MainActor
final class ChatViewModel {
    var messages: [ChatMessage] = []
    var inputText = ""
    var isStreaming = false
    var streamingContent = ""
    var errorMessage: String?

    // Task & Scene
    var selectedTask: String? = nil
    var selectedScene = "general"
    var langDir = "zh2vi"
    var tone: Double = 50

    // Conversation
    var conversationId: String?

    private let chatService = ChatService()

    var history: [HistoryMessage] {
        messages.suffix(10).map { msg in
            HistoryMessage(role: msg.role.rawValue, content: msg.content)
        }
    }

    func send() async {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isStreaming else { return }

        let userMsg = ChatMessage.user(text)
        messages.append(userMsg)
        inputText = ""
        isStreaming = true
        streamingContent = ""
        errorMessage = nil

        do {
            let bytes = try await chatService.sendStreaming(
                input: text,
                task: selectedTask,
                scene: selectedScene,
                langDir: langDir,
                tone: Int(tone),
                conversationId: conversationId,
                history: history
            )

            var fullContent = ""
            var finalEvent: SSEDoneEvent?

            try await SSEClient.parse(bytes: bytes) { event in
                switch event {
                case .delta(let content):
                    fullContent += content
                    Task { @MainActor in
                        self.streamingContent = fullContent
                    }
                case .done(let done):
                    finalEvent = done
                case .error(let msg):
                    Task { @MainActor in
                        self.errorMessage = msg
                    }
                }
            }

            // Create final message
            if let done = finalEvent {
                conversationId = done.conversationId
                let assistantMsg = ChatMessage.assistant(
                    content: fullContent,
                    type: done.messageType,
                    data: done.data,
                    warnings: done.proactiveWarnings
                )
                messages.append(assistantMsg)
            } else if !fullContent.isEmpty {
                let assistantMsg = ChatMessage.assistant(
                    content: fullContent,
                    type: nil,
                    data: nil,
                    warnings: nil
                )
                messages.append(assistantMsg)
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        streamingContent = ""
        isStreaming = false
    }

    func newConversation() {
        messages.removeAll()
        conversationId = nil
        streamingContent = ""
        errorMessage = nil
    }

    func loadConversation(_ detail: ConversationDetail) {
        conversationId = detail.id
        messages = detail.messages.map { msg in
            ChatMessage(
                id: msg.id,
                role: msg.role == "user" ? .user : .assistant,
                content: msg.content,
                responseType: nil,
                data: nil,
                proactiveWarnings: nil,
                timestamp: Date()
            )
        }
    }
}
