// ============================================================================
// VietBridge AI — Teach Card
// Vietnamese phrase teaching with pinyin, meaning, examples
// ============================================================================

import SwiftUI

struct TeachCard: View {
    let data: TeachData

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("越语教学", systemImage: "graduationcap")
                .font(.caption.bold())
                .foregroundStyle(.teachAccent)

            if let phrase = data.phrase {
                Text(phrase)
                    .font(.title3.bold())
                    .foregroundStyle(.textPrimary)

                HStack(spacing: 12) {
                    ActionButton(icon: "speaker.wave.2", label: "播放") {
                        TTSService.shared.speakVietnamese(phrase)
                    }
                    ActionButton(icon: "doc.on.doc", label: "复制") {
                        UIPasteboard.general.string = phrase
                    }
                }
            }

            if let pinyin = data.pinyin {
                Text(pinyin)
                    .font(.subheadline)
                    .foregroundStyle(.textSecondary)
            }

            if let meaning = data.meaning {
                Text(meaning)
                    .font(.body)
                    .foregroundStyle(.textPrimary)
            }

            if let examples = data.examples, !examples.isEmpty {
                Divider()
                Text("例句")
                    .font(.caption.bold())
                    .foregroundStyle(.textSecondary)
                ForEach(examples) { ex in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(ex.vi)
                                .font(.subheadline.bold())
                            Spacer()
                            Button {
                                TTSService.shared.speakVietnamese(ex.vi)
                            } label: {
                                Image(systemName: "speaker.wave.2")
                                    .font(.caption)
                                    .foregroundStyle(.textTertiary)
                            }
                        }
                        Text(ex.zh)
                            .font(.caption)
                            .foregroundStyle(.textSecondary)
                        if let situation = ex.situation {
                            Text(situation)
                                .font(.caption2)
                                .foregroundStyle(.textTertiary)
                        }
                    }
                    .padding(8)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }

            if let note = data.culturalNote, !note.isEmpty {
                Text(note)
                    .font(.caption)
                    .foregroundStyle(.textSecondary)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.teachAccent.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(16)
        .cardStyle()
    }
}
