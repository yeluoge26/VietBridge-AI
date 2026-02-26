// ============================================================================
// VietBridge AI — SSE (Server-Sent Events) Client
// Parses SSE streams from the chat API
// ============================================================================

import Foundation

enum SSEEvent: Sendable {
    case delta(String)
    case done(SSEDoneEvent)
    case error(String)
}

struct SSEClient: Sendable {

    /// Parse an SSE byte stream into typed events
    static func parse(
        bytes: URLSession.AsyncBytes,
        onEvent: @Sendable (SSEEvent) -> Void
    ) async throws {
        let decoder = JSONDecoder()

        for try await line in bytes.lines {
            guard line.hasPrefix("data: ") else { continue }

            let jsonString = String(line.dropFirst(6))
            guard let jsonData = jsonString.data(using: .utf8) else { continue }

            // Try to parse as a generic dict to check "type"
            guard let dict = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any],
                  let type = dict["type"] as? String else { continue }

            switch type {
            case "delta":
                if let content = dict["content"] as? String {
                    onEvent(.delta(content))
                }

            case "done":
                if let event = try? decoder.decode(SSEDoneEvent.self, from: jsonData) {
                    onEvent(.done(event))
                }

            case "error":
                let errorMsg = dict["error"] as? String ?? "未知错误"
                onEvent(.error(errorMsg))

            default:
                break
            }
        }
    }
}
