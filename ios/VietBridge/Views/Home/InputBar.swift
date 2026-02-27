import SwiftUI

struct InputBar: View {
    @Binding var text: String
    let loading: Bool
    var speechService: SpeechService
    var voiceLang: String
    var onSend: () -> Void
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 8) {
            // Mic button
            Button {
                if speechService.isListening {
                    speechService.stopListening()
                    if !speechService.transcript.isEmpty {
                        text = speechService.transcript
                    }
                } else {
                    speechService.startListening(lang: voiceLang)
                }
            } label: {
                Image(systemName: speechService.isListening ? "mic.fill" : "mic")
                    .font(.system(size: 18))
                    .foregroundStyle(speechService.isListening ? .red : .textTertiary)
                    .frame(width: 36, height: 36)
            }

            // Text field
            TextField("输入内容...", text: $text, axis: .vertical)
                .font(.system(size: 14))
                .lineLimit(1...4)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.bgInput)
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .focused($isFocused)
                .onSubmit {
                    sendAndDismiss()
                }
                .submitLabel(.send)

            // Send button
            Button {
                sendAndDismiss()
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 30))
                    .foregroundStyle(text.trimmingCharacters(in: .whitespaces).isEmpty || loading
                        ? Color.textTertiary : Color.textPrimary)
            }
            .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty || loading)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.bgPrimary)
        .onChange(of: speechService.transcript) { _, t in
            if !t.isEmpty { text = t }
        }
    }

    private func sendAndDismiss() {
        isFocused = false
        onSend()
    }
}
