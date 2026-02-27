import SwiftUI

struct TeachCard: View {
    let data: ChatResponseData

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 4) {
                Image(systemName: "book.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(.orange)
                Text("教你说")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.orange)
            }

            if let phrase = data.phrase {
                if let vi = phrase.vi {
                    Text(vi)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(.textPrimary)
                    ActionButtons(text: vi)
                }

                if let pinyin = phrase.pinyin {
                    Text(pinyin)
                        .font(.system(size: 14))
                        .foregroundStyle(.textTertiary)
                        .italic()
                }

                if let zh = phrase.zh {
                    HStack(spacing: 4) {
                        Text("中文:")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(.textTertiary)
                        Text(zh)
                            .font(.system(size: 13))
                            .foregroundStyle(.textPrimary)
                    }
                }
            }

            if let ctx = data.context {
                Text("💡 \(ctx)")
                    .font(.system(size: 12))
                    .foregroundStyle(.textSecondary)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            if let culture = data.culture {
                Text("🌏 \(culture)")
                    .font(.system(size: 12))
                    .foregroundStyle(.textSecondary)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(hex: "#FFF8E1"))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            if let examples = data.examples, !examples.isEmpty {
                Text("例句")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.textSecondary)
                ForEach(examples) { ex in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(ex.vi)
                                .font(.system(size: 13, weight: .medium))
                            Text(ex.zh)
                                .font(.system(size: 12))
                                .foregroundStyle(.textSecondary)
                        }
                        Spacer()
                        Button {
                            TTSService.shared.speak(ex.vi)
                        } label: {
                            Image(systemName: "play.fill")
                                .font(.system(size: 10))
                                .foregroundStyle(.vbAccent)
                                .frame(width: 24, height: 24)
                                .background(Color.vbAccent.opacity(0.1))
                                .clipShape(Circle())
                        }
                    }
                }
            }
        }
        .padding(16)
        .cardStyle()
    }
}
