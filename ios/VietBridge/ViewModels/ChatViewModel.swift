import Foundation

@Observable
@MainActor
final class ChatViewModel {
    var messages: [ChatMessage] = []
    var loading = false
    var error: String?
    var task = "translate"
    var scene = "general"
    var tone = 50
    var langDir = "zh2vi"
    var conversationId: String?
    var detectedIntent: IntentInfo?

    func send(_ text: String) {
        guard !text.isEmpty, !loading else { return }
        messages.append(ChatMessage(type: .user, text: text))
        loading = true
        error = nil

        let streamMsg = ChatMessage(type: .streaming, text: "")
        messages.append(streamMsg)
        let streamIndex = messages.count - 1

        // Build conversation history from existing messages
        let history = messages.dropLast(2).map { m -> ConversationEntry in
            ConversationEntry(
                role: m.type == .user ? "user" : "assistant",
                content: m.text
            )
        }

        Task {
            do {
                var req = ChatRequest(
                    input: text, task: task, scene: scene, tone: tone,
                    stream: true, langDir: langDir
                )
                if let cid = conversationId {
                    req.conversationId = cid
                }
                if !history.isEmpty {
                    req.conversationHistory = Array(history)
                }

                let bytes = try await APIClient.shared.streamSSE("/api/chat", body: req)
                var accumulated = ""
                var finalData: ChatResponseData?
                var finalType: String?
                var warnings: [ProactiveWarning]?
                var kbHits: [KBHit]?

                for try await line in bytes.lines {
                    guard line.hasPrefix("data: ") else { continue }
                    let json = String(line.dropFirst(6))
                    guard let data = json.data(using: .utf8) else { continue }
                    let decoder = JSONDecoder()
                    guard let event = try? decoder.decode(SSEEvent.self, from: data) else { continue }

                    switch event.type {
                    case "delta":
                        accumulated += event.content ?? ""
                        messages[streamIndex].text = accumulated
                    case "done":
                        finalData = event.data
                        finalType = event.messageType
                        conversationId = event.conversationId ?? conversationId
                        warnings = event.proactiveWarnings
                        kbHits = event.kbHits
                        if let intent = event.intent,
                           let intentTask = intent.task,
                           let confidence = intent.confidence,
                           confidence >= 0.6,
                           intentTask != self.task {
                            self.detectedIntent = intent
                        } else {
                            self.detectedIntent = nil
                        }
                    case "error":
                        error = event.error ?? "请求失败"
                    default: break
                    }
                }

                messages[streamIndex] = ChatMessage(
                    type: .assistant,
                    text: accumulated,
                    responseType: finalType,
                    data: finalData,
                    proactiveWarnings: warnings,
                    kbHits: kbHits
                )
            } catch {
                self.error = error.localizedDescription
                if streamIndex < messages.count {
                    messages.remove(at: streamIndex)
                }
            }
            loading = false
        }
    }

    func clearMessages() {
        messages.removeAll()
        conversationId = nil
    }
}
