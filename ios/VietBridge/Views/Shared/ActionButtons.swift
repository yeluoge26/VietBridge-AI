// ============================================================================
// VietBridge AI — Action Buttons
// Reusable play/copy/share button group
// ============================================================================

import SwiftUI

struct ActionButton: View {
    let icon: String
    var label: String = ""
    let action: () -> Void

    var body: some View {
        Button {
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
            action()
        } label: {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption)
                if !label.isEmpty {
                    Text(label)
                        .font(.caption2)
                }
            }
            .foregroundStyle(.textSecondary)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.bgInput)
            .clipShape(Capsule())
        }
    }
}

// MARK: - Share Helper

func shareText(_ text: String) {
    let av = UIActivityViewController(activityItems: [text], applicationActivities: nil)
    if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
       let rootVC = windowScene.windows.first?.rootViewController {
        rootVC.present(av, animated: true)
    }
}
