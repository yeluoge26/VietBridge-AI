import SwiftUI

struct TranslationCard: View {
    let data: ChatResponseData

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 4) {
                Image(systemName: "globe")
                    .font(.system(size: 12))
                    .foregroundStyle(.indigo)
                Text("翻译")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.indigo)
            }

            if let t = data.translation {
                Text(t)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(.textPrimary)
                ActionButtons(text: t)
            }

            if let natural = data.natural {
                HStack(spacing: 4) {
                    Text("自然变体:")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(.textTertiary)
                    Text(natural)
                        .font(.system(size: 13))
                        .foregroundStyle(.textSecondary)
                }
            }

            if let ctx = data.context, !ctx.isEmpty {
                Text(ctx)
                    .font(.system(size: 12))
                    .foregroundStyle(.textSecondary)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            if let tone = data.tone {
                infoRow("🎭", "语气分析", tone)
            }
            if let gn = data.grammarNote {
                infoRow("📝", "语法提示", gn.displayText)
            }
            if let culture = data.culture {
                infoRow("🌏", "文化提示", culture)
            }
        }
        .padding(16)
        .cardStyle()
    }

    private func infoRow(_ emoji: String, _ label: String, _ text: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(emoji) \(label)")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.textTertiary)
            Text(text)
                .font(.system(size: 12))
                .foregroundStyle(.textSecondary)
        }
    }
}
