// ============================================================================
// VietBridge AI — Daily Phrase Card
// ============================================================================

import SwiftUI

struct DailyCard: View {
    let phrase: DailyPhrase

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(phrase.vi)
                    .font(.headline.bold())
                    .foregroundStyle(.textPrimary)
                Spacer()
                Button {
                    TTSService.shared.speakVietnamese(phrase.vi)
                } label: {
                    Image(systemName: "speaker.wave.2.fill")
                        .font(.caption)
                        .foregroundStyle(.accent)
                        .padding(8)
                        .background(Color.accent.opacity(0.1))
                        .clipShape(Circle())
                }
            }

            Text(phrase.pinyin)
                .font(.caption)
                .foregroundStyle(.textSecondary)

            Text(phrase.zh)
                .font(.subheadline)
                .foregroundStyle(.textPrimary)
        }
        .padding(16)
        .cardStyle()
    }
}
