import SwiftUI

struct ReplyCard: View {
    let data: ChatResponseData

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 4) {
                Image(systemName: "bubble.left.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(.teal)
                Text("回复建议")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.teal)
            }

            if let emotion = data.emotion {
                HStack(spacing: 4) {
                    Text("情绪分析:")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(.textTertiary)
                    Text(emotion)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.textPrimary)
                }
            }

            if let explanation = data.explanation {
                Text(explanation)
                    .font(.system(size: 12))
                    .foregroundStyle(.textSecondary)
                    .padding(8)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            if let replies = data.replies {
                ForEach(replies) { reply in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(reply.style)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(styleColor(reply.level))
                                .clipShape(Capsule())
                            Spacer()
                        }
                        Text(reply.text)
                            .font(.system(size: 15, weight: .medium))
                            .foregroundStyle(.textPrimary)
                        if let zh = reply.zh {
                            Text(zh)
                                .font(.system(size: 12))
                                .foregroundStyle(.textTertiary)
                        }
                        ActionButtons(text: reply.text)
                    }
                    .padding(10)
                    .background(Color.bgInput.opacity(0.5))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .padding(16)
        .cardStyle()
    }

    private func styleColor(_ level: Int?) -> Color {
        switch level {
        case 1: .vbAccent
        case 2: .vbBlue
        case 3: .riskOrange
        default: .textSecondary
        }
    }
}
