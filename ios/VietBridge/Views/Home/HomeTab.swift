import SwiftUI

struct HomeTab: View {
    @State private var vm = ChatViewModel()
    @State private var input = ""
    @State private var drawerOpen = false
    @State private var toneActive = false
    @State private var toast = ""
    @State private var showToast = false
    @State private var speechService = SpeechService()

    var body: some View {
        VStack(spacing: 0) {
            // Top bar
            HStack {
                Text("VietBridge AI")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(.textPrimary)
                Spacer()
                Button { drawerOpen = true } label: {
                    HStack(spacing: 4) {
                        Text(taskInfo(for: vm.task).emoji)
                        Text(taskInfo(for: vm.task).label)
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.bgInput)
                    .clipShape(Capsule())
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color.bgPrimary)

            // Context bar
            HStack(spacing: 8) {
                Text(taskInfo(for: vm.task).emoji + " " + taskInfo(for: vm.task).label)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.textSecondary)
                Spacer()
                Button {
                    vm.langDir = vm.langDir == "zh2vi" ? "vi2zh" : "zh2vi"
                } label: {
                    HStack(spacing: 4) {
                        Text(vm.langDir == "zh2vi" ? "中→越" : "越→中")
                            .font(.system(size: 11, weight: .semibold))
                        Image(systemName: "arrow.left.arrow.right")
                            .font(.system(size: 10))
                    }
                    .foregroundStyle(.textPrimary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.bgInput)
                    .clipShape(Capsule())
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 6)

            // Scene chips
            SceneChips(activeScene: $vm.scene)

            // Auto-detect intent banner
            if let intent = vm.detectedIntent, let intentTask = intent.task {
                let info = taskInfo(for: intentTask)
                HStack(spacing: 8) {
                    Text("💡")
                    Text("检测到可能需要「\(info.label)」")
                        .font(.system(size: 12))
                        .foregroundStyle(.textPrimary)
                    Spacer()
                    Button {
                        vm.task = intentTask
                        if let s = intent.scene { vm.scene = s }
                        vm.detectedIntent = nil
                    } label: {
                        Text("切换")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 4)
                            .background(info.color)
                            .clipShape(Capsule())
                    }
                    Button {
                        vm.detectedIntent = nil
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 10))
                            .foregroundStyle(.textTertiary)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color(hex: "#FFF8E1"))
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .padding(.horizontal, 16)
                .transition(.move(edge: .top).combined(with: .opacity))
            }

            // Chat messages
            ChatView(messages: vm.messages, loading: vm.loading)

            // Tone bar
            if toneActive {
                ToneSlider(value: $vm.tone)
            }

            // Bottom controls
            HStack(spacing: 8) {
                Button {
                    toneActive.toggle()
                } label: {
                    Text("语气 \(vm.tone)")
                        .font(.system(size: 12, weight: .medium))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .foregroundStyle(toneActive ? .white : Color.textSecondary)
                        .background(toneActive ? Color.textPrimary : Color.bgCard)
                        .clipShape(Capsule())
                        .overlay(Capsule().stroke(Color.borderLight, lineWidth: toneActive ? 0 : 1))
                }

                Spacer()

                if !vm.messages.isEmpty {
                    Button {
                        vm.clearMessages()
                        showToastMsg("新对话已开始")
                    } label: {
                        Text("新对话")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(.textSecondary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.bgCard)
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(Color.borderLight, lineWidth: 1))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 4)

            // Input bar
            InputBar(
                text: $input,
                loading: vm.loading,
                speechService: speechService,
                voiceLang: vm.langDir == "zh2vi" ? "zh-CN" : "vi-VN",
                onSend: {
                    let t = input.trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !t.isEmpty else { return }
                    vm.send(t)
                    input = ""
                }
            )
        }
        .background(Color.bgPrimary)
        .onTapGesture {
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
        .sheet(isPresented: $drawerOpen) {
            TaskDrawer(task: $vm.task, langDir: $vm.langDir, tone: $vm.tone)
                .presentationDetents([.medium])
        }
        .overlay(alignment: .top) {
            if showToast {
                Text(toast)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.textPrimary.opacity(0.9))
                    .clipShape(Capsule())
                    .padding(.top, 8)
                    .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.2), value: showToast)
        .onChange(of: vm.error) { _, err in
            if let err { showToastMsg(err) }
        }
    }

    private func showToastMsg(_ msg: String) {
        toast = msg
        showToast = true
        Task {
            try? await Task.sleep(for: .seconds(2.5))
            showToast = false
        }
    }
}
