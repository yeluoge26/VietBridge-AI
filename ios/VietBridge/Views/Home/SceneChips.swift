// ============================================================================
// VietBridge AI — Scene Chips
// Horizontal scrollable scene selector
// ============================================================================

import SwiftUI

struct SceneChips: View {
    @Binding var selected: String

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(SceneInfo.allScenes) { scene in
                    Button {
                        withAnimation(.spring(duration: 0.2)) {
                            selected = scene.id
                        }
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: scene.icon)
                                .font(.caption)
                            Text(scene.name)
                                .font(.caption.bold())
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            selected == scene.id
                            ? Color.textPrimary
                            : Color.bgInput
                        )
                        .foregroundStyle(
                            selected == scene.id
                            ? .white
                            : .textSecondary
                        )
                        .clipShape(Capsule())
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }
}
