// ============================================================================
// VietBridge AI — Reply Card
// Shows suggested replies with tone and translation
// ============================================================================

import SwiftUI

struct ReplyCard: View {
    let data: ReplyData

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("回复建议", systemImage: "text.bubble")
                .font(.caption.bold())
                .foregroundStyle(.replyAccent)

            if let replies = data.replies {
                ForEach(replies) { reply in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(reply.text)
                            .font(.body.bold())
                            .foregroundStyle(.textPrimary)

                        if let pinyin = reply.pinyin {
                            Text(pinyin)
                                .font(.caption)
                                .foregroundStyle(.textSecondary)
                        }

                        if let translation = reply.translation {
                            Text(translation)
                                .font(.caption)
                                .foregroundStyle(.textTertiary)
                        }

                        HStack(spacing: 12) {
                            if let tone = reply.tone {
                                Text(tone)
                                    .font(.caption2)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.replyAccent.opacity(0.1))
                                    .foregroundStyle(.replyAccent)
                                    .clipShape(Capsule())
                            }
                            Spacer()
                            ActionButton(icon: "speaker.wave.2", label: "") {
                                TTSService.shared.speakVietnamese(reply.text)
                            }
                            ActionButton(icon: "doc.on.doc", label: "") {
                                UIPasteboard.general.string = reply.text
                            }
                        }
                    }
                    .padding(10)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }

            if let note = data.culturalNote, !note.isEmpty {
                Text(note)
                    .font(.caption)
                    .foregroundStyle(.textSecondary)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.replyAccent.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(16)
        .cardStyle()
    }
}
