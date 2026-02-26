// ============================================================================
// VietBridge AI — Input Bar
// Text input with send, mic, and task selector buttons
// ============================================================================

import SwiftUI

struct InputBar: View {
    @Bindable var viewModel: ChatViewModel
    @Binding var showTaskDrawer: Bool
    @State private var speechService = SpeechService()

    var body: some View {
        VStack(spacing: 0) {
            Divider()

            HStack(spacing: 10) {
                // Task selector
                Button {
                    showTaskDrawer = true
                } label: {
                    Image(systemName: taskIcon)
                        .font(.title3)
                        .foregroundStyle(.textSecondary)
                        .frame(width: 36, height: 36)
                }

                // Text field
                HStack {
                    TextField(
                        speechService.isListening ? "正在听..." : "输入中文或越南语...",
                        text: $viewModel.inputText,
                        axis: .vertical
                    )
                    .lineLimit(1...4)
                    .font(.body)
                    .textFieldStyle(.plain)
                    .onSubmit { Task { await viewModel.send() } }

                    // Mic button
                    Button {
                        handleMicTap()
                    } label: {
                        Image(systemName: speechService.isListening ? "stop.circle.fill" : "mic.fill")
                            .font(.title3)
                            .foregroundStyle(speechService.isListening ? .riskRed : .textTertiary)
                            .symbolEffect(.pulse, isActive: speechService.isListening)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.bgInput)
                .clipShape(RoundedRectangle(cornerRadius: 20))

                // Send button
                Button {
                    Task { await viewModel.send() }
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundStyle(
                            viewModel.inputText.trimmingCharacters(in: .whitespaces).isEmpty
                            ? .textTertiary
                            : .textPrimary
                        )
                }
                .disabled(viewModel.inputText.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isStreaming)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
        }
        .background(Color.bgPrimary)
        .onChange(of: speechService.transcript) { _, newValue in
            if !newValue.isEmpty {
                viewModel.inputText = newValue
            }
        }
    }

    private var taskIcon: String {
        switch viewModel.selectedTask {
        case "translate": "textformat.abc"
        case "reply": "text.bubble"
        case "risk": "shield.checkered"
        case "learn": "graduationcap"
        default: "square.grid.2x2"
        }
    }

    private func handleMicTap() {
        if speechService.isListening {
            speechService.stopListening()
        } else {
            Task {
                let granted = await speechService.requestPermission()
                if granted {
                    let lang = viewModel.langDir == "zh2vi" ? "zh-CN" : "vi-VN"
                    speechService.startListening(language: lang)
                }
            }
        }
    }
}
