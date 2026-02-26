// ============================================================================
// VietBridge AI — Chat View
// Message list with streaming indicator
// ============================================================================

import SwiftUI

struct ChatView: View {
    let viewModel: ChatViewModel

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    if viewModel.messages.isEmpty {
                        emptyState
                    } else {
                        ForEach(viewModel.messages) { msg in
                            MessageBubble(message: msg)
                                .id(msg.id)
                        }

                        // Streaming indicator
                        if viewModel.isStreaming {
                            streamingBubble
                                .id("streaming")
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .scrollDismissesKeyboard(.interactively)
            .onChange(of: viewModel.messages.count) {
                if let lastId = viewModel.messages.last?.id {
                    withAnimation {
                        proxy.scrollTo(lastId, anchor: .bottom)
                    }
                }
            }
            .onChange(of: viewModel.streamingContent) {
                withAnimation {
                    proxy.scrollTo("streaming", anchor: .bottom)
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer().frame(height: 60)
            Image(systemName: "globe.asia.australia.fill")
                .font(.system(size: 48))
                .foregroundStyle(.textTertiary)
            Text("你好！我是 VietBridge AI")
                .font(.title3.bold())
                .foregroundStyle(.textPrimary)
            Text("输入中文或越南语，我来帮你翻译、回复建议、风险评估或教你越南语")
                .font(.subheadline)
                .foregroundStyle(.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
    }

    private var streamingBubble: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(viewModel.streamingContent.isEmpty ? "思考中..." : viewModel.streamingContent)
                    .font(.body)
                    .foregroundStyle(.textPrimary)
                if viewModel.streamingContent.isEmpty {
                    LoadingDots()
                }
            }
            .padding(12)
            .background(Color.bgCard)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            Spacer(minLength: 40)
        }
    }
}

// MARK: - Message Bubble

struct MessageBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.role == .user { Spacer(minLength: 60) }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .font(.body)
                    .foregroundStyle(message.role == .user ? .white : .textPrimary)
                    .padding(12)
                    .background(
                        message.role == .user
                        ? Color.textPrimary
                        : Color.bgCard
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }

            if message.role == .assistant { Spacer(minLength: 60) }
        }
    }
}
