import SwiftUI

struct ChatView: View {
    let messages: [ChatMessage]
    let loading: Bool

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    if messages.isEmpty {
                        emptyState
                    }

                    ForEach(messages) { msg in
                        switch msg.type {
                        case .user:
                            userBubble(msg.text)
                        case .streaming:
                            streamingBubble(msg.text)
                        case .assistant:
                            assistantContent(msg)
                        }
                    }

                    if loading && messages.last?.type != .streaming {
                        LoadingDots()
                            .padding(.vertical, 8)
                    }
                }
                .padding(16)
                .id("bottom")
            }
            .onChange(of: messages.count) { _, _ in
                withAnimation { proxy.scrollTo("bottom", anchor: .bottom) }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Spacer().frame(height: 60)
            Text("🇻🇳")
                .font(.system(size: 48))
            Text("越南生活AI助手")
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(.textPrimary)
            Text("翻译 · 回复建议 · 风险分析 · 学越语")
                .font(.system(size: 13))
                .foregroundStyle(.textSecondary)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    private func userBubble(_ text: String) -> some View {
        HStack {
            Spacer()
            Text(text)
                .font(.system(size: 14))
                .foregroundStyle(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Color.textPrimary)
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private func streamingBubble(_ text: String) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(text)
                    .font(.system(size: 14))
                    .foregroundStyle(.textPrimary)
                LoadingDots()
            }
            .padding(12)
            .cardStyle()
            Spacer()
        }
    }

    @ViewBuilder
    private func assistantContent(_ msg: ChatMessage) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                if let type = msg.responseType, let data = msg.data {
                    switch type {
                    case "translation": TranslationCard(data: data)
                    case "reply": ReplyCard(data: data)
                    case "risk": RiskCard(data: data)
                    case "teaching", "teach": TeachCard(data: data)
                    default: textCard(msg.text)
                    }
                } else {
                    textCard(msg.text)
                }

                // Proactive warnings
                if let warnings = msg.proactiveWarnings, !warnings.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(Array(warnings.enumerated()), id: \.offset) { _, w in
                            HStack(spacing: 4) {
                                Text(warningIcon(w.type))
                                    .font(.system(size: 11))
                                Text(w.text)
                                    .font(.system(size: 12))
                                    .foregroundStyle(.textSecondary)
                            }
                        }
                    }
                    .padding(10)
                    .background(Color(hex: "#FFF8E1"))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            Spacer()
        }
    }

    private func textCard(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14))
            .foregroundStyle(.textPrimary)
            .padding(12)
            .cardStyle()
    }

    private func warningIcon(_ type: String) -> String {
        switch type {
        case "price": "💰"
        case "risk": "⚠️"
        case "tone": "🎭"
        default: "💡"
        }
    }
}
