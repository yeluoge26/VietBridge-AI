import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeTab().tag(0).tabItem {
                Image(systemName: "message.fill")
                Text("对话")
            }
            ScanTab().tag(1).tabItem {
                Image(systemName: "camera.fill")
                Text("扫描")
            }
            LearnTab().tag(2).tabItem {
                Image(systemName: "book.fill")
                Text("学习")
            }
            GuideTab().tag(3).tabItem {
                Image(systemName: "map.fill")
                Text("指南")
            }
            ProfileTab().tag(4).tabItem {
                Image(systemName: "person.fill")
                Text("我的")
            }
        }
        .tint(.textPrimary)
        .onChange(of: selectedTab) { _, _ in
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
    }
}
