// ============================================================================
// VietBridge AI — View Extensions
// Common modifiers and helpers
// ============================================================================

import SwiftUI

extension View {
    /// Standard card style matching web app
    func cardStyle() -> some View {
        self
            .background(Color.bgCard)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
    }

    /// Haptic feedback on tap
    func haptic(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .light) {
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }
}

// MARK: - Toast Modifier

struct ToastModifier: ViewModifier {
    let message: String
    @Binding var isShowing: Bool

    func body(content: Content) -> some View {
        content.overlay(alignment: .top) {
            if isShowing {
                Text(message)
                    .font(.footnote.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.textPrimary.opacity(0.9))
                    .clipShape(Capsule())
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .padding(.top, 8)
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            withAnimation { isShowing = false }
                        }
                    }
            }
        }
        .animation(.spring(duration: 0.3), value: isShowing)
    }
}

extension View {
    func toast(_ message: String, isShowing: Binding<Bool>) -> some View {
        modifier(ToastModifier(message: message, isShowing: isShowing))
    }
}
