// ============================================================================
// VietBridge AI — Global App State
// Manages authentication state across the app
// ============================================================================

import SwiftUI

@Observable
final class AppState {
    var currentUser: User?
    var isCheckingAuth = true
    var isAuthenticated: Bool { currentUser != nil }

    private let authService = AuthService()

    init() {
        Task { await checkAuth() }
    }

    /// Check if stored token is still valid
    @MainActor
    func checkAuth() async {
        isCheckingAuth = true
        defer { isCheckingAuth = false }

        guard KeychainHelper.getToken() != nil else { return }

        do {
            let user = try await authService.me()
            currentUser = user
        } catch {
            // Token expired or invalid
            KeychainHelper.deleteToken()
            currentUser = nil
        }
    }

    /// Login with email and password
    @MainActor
    func login(email: String, password: String) async throws {
        let response = try await authService.login(email: email, password: password)
        KeychainHelper.saveToken(response.token)
        currentUser = response.user
    }

    /// Register a new account
    @MainActor
    func register(name: String, email: String, password: String) async throws {
        let response = try await authService.register(name: name, email: email, password: password)
        KeychainHelper.saveToken(response.token)
        currentUser = response.user
    }

    /// Sign out
    @MainActor
    func signOut() {
        KeychainHelper.deleteToken()
        currentUser = nil
    }
}
