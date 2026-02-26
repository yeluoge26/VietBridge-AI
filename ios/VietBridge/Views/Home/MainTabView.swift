// ============================================================================
// VietBridge AI — Main Tab View
// Bottom tab bar navigation (Home, Scan, Learn, Profile)
// ============================================================================

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab("对话", systemImage: "bubble.left.and.bubble.right.fill", value: 0) {
                HomeTab()
            }

            Tab("扫描", systemImage: "doc.text.viewfinder", value: 1) {
                ScanTab()
            }

            Tab("学习", systemImage: "book.fill", value: 2) {
                LearnTab()
            }

            Tab("我的", systemImage: "person.fill", value: 3) {
                ProfileTab()
            }
        }
        .tint(.textPrimary)
    }
}
