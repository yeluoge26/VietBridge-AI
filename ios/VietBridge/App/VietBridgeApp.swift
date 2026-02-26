// ============================================================================
// VietBridge AI — iOS App Entry Point
// ============================================================================

import SwiftUI

@main
struct VietBridgeApp: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            Group {
                if appState.isCheckingAuth {
                    LaunchScreen()
                } else if appState.isAuthenticated {
                    MainTabView()
                } else {
                    LoginView()
                }
            }
            .environment(appState)
            .preferredColorScheme(.light)
        }
    }
}

// MARK: - Launch Screen

private struct LaunchScreen: View {
    var body: some View {
        ZStack {
            Color.bgPrimary.ignoresSafeArea()
            VStack(spacing: 16) {
                Image(systemName: "globe.asia.australia.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(.accent)
                Text("VietBridge AI")
                    .font(.title2.bold())
                    .foregroundStyle(.textPrimary)
                ProgressView()
                    .tint(.accent)
            }
        }
    }
}
