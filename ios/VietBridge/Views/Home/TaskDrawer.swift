// ============================================================================
// VietBridge AI — Task Drawer
// Bottom sheet for selecting task, language direction, and tone
// ============================================================================

import SwiftUI

struct TaskDrawer: View {
    @Binding var selectedTask: String?
    @Binding var langDir: String
    @Binding var tone: Double
    @Environment(\.dismiss) private var dismiss

    private let tasks: [(id: String?, label: String, icon: String, color: Color)] = [
        (nil, "自动", "sparkles", .textSecondary),
        ("translate", "翻译", "textformat.abc", .translationAccent),
        ("reply", "回复", "text.bubble", .replyAccent),
        ("risk", "风险", "shield.checkered", .riskAccent),
        ("learn", "教学", "graduationcap", .teachAccent),
    ]

    var body: some View {
        VStack(spacing: 24) {
            // Tasks
            VStack(alignment: .leading, spacing: 12) {
                Text("任务类型")
                    .font(.headline)
                    .foregroundStyle(.textPrimary)

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 10) {
                    ForEach(tasks, id: \.label) { task in
                        Button {
                            selectedTask = task.id
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        } label: {
                            VStack(spacing: 6) {
                                Image(systemName: task.icon)
                                    .font(.title3)
                                Text(task.label)
                                    .font(.caption.bold())
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(
                                selectedTask == task.id
                                ? task.color.opacity(0.12)
                                : Color.bgInput
                            )
                            .foregroundStyle(
                                selectedTask == task.id
                                ? task.color
                                : .textSecondary
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
            }

            // Language direction
            VStack(alignment: .leading, spacing: 12) {
                Text("翻译方向")
                    .font(.headline)
                    .foregroundStyle(.textPrimary)

                HStack(spacing: 12) {
                    langButton(id: "zh2vi", label: "中→越")
                    langButton(id: "vi2zh", label: "越→中")
                }
            }

            // Tone slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("语气")
                        .font(.headline)
                        .foregroundStyle(.textPrimary)
                    Spacer()
                    Text(toneLabel)
                        .font(.caption)
                        .foregroundStyle(.textSecondary)
                }
                Slider(value: $tone, in: 0...100, step: 1)
                    .tint(.textPrimary)
                HStack {
                    Text("随意")
                        .font(.caption2)
                        .foregroundStyle(.textTertiary)
                    Spacer()
                    Text("正式")
                        .font(.caption2)
                        .foregroundStyle(.textTertiary)
                }
            }

            Spacer()
        }
        .padding(24)
    }

    private func langButton(id: String, label: String) -> some View {
        Button {
            langDir = id
        } label: {
            Text(label)
                .font(.body.bold())
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(langDir == id ? Color.textPrimary : Color.bgInput)
                .foregroundStyle(langDir == id ? .white : .textSecondary)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var toneLabel: String {
        switch tone {
        case 0..<20: "很随意"
        case 20..<40: "随意"
        case 40..<60: "中性"
        case 60..<80: "正式"
        default: "很正式"
        }
    }
}
