// ============================================================================
// VietBridge AI — Translation Card
// Displays translation result with pinyin, context, alternatives
// ============================================================================

import SwiftUI

struct TranslationCard: View {
    let data: TranslationData

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            Label("翻译", systemImage: "textformat.abc")
                .font(.caption.bold())
                .foregroundStyle(.translationAccent)

            // Main translation
            if let translation = data.translation {
                Text(translation)
                    .font(.title3.bold())
                    .foregroundStyle(.textPrimary)

                // Action buttons
                HStack(spacing: 16) {
                    ActionButton(icon: "speaker.wave.2", label: "播放") {
                        TTSService.shared.speakChinese(translation)
                    }
                    ActionButton(icon: "doc.on.doc", label: "复制") {
                        UIPasteboard.general.string = translation
                    }
                    ActionButton(icon: "square.and.arrow.up", label: "分享") {
                        shareText(translation)
                    }
                }
            }

            // Pinyin
            if let pinyin = data.pinyin {
                Text(pinyin)
                    .font(.subheadline)
                    .foregroundStyle(.textSecondary)
            }

            // Context
            if let context = data.context, !context.isEmpty {
                Text(context)
                    .font(.caption)
                    .foregroundStyle(.textSecondary)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            // Alternatives
            if let alts = data.alternatives, !alts.isEmpty {
                Divider()
                Text("其他译法")
                    .font(.caption.bold())
                    .foregroundStyle(.textSecondary)
                ForEach(alts, id: \.text) { alt in
                    HStack {
                        Text(alt.text)
                            .font(.subheadline)
                        if let tone = alt.tone {
                            Text(tone)
                                .font(.caption2)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.bgInput)
                                .clipShape(Capsule())
                        }
                        Spacer()
                    }
                }
            }
        }
        .padding(16)
        .cardStyle()
    }
}
