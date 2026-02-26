// ============================================================================
// VietBridge AI — Auth Service
// Login, Register, Token validation
// ============================================================================

import Foundation

struct AuthService: Sendable {
    private let api = APIClient.shared

    struct LoginRequest: Codable, Sendable {
        let email: String
        let password: String
    }

    /// Login with email and password, returns JWT token + user
    func login(email: String, password: String) async throws -> AuthResponse {
        try await api.request(
            "POST",
            path: "/api/auth/mobile",
            body: LoginRequest(email: email, password: password)
        )
    }

    /// Register new account
    func register(name: String, email: String, password: String) async throws -> AuthResponse {
        try await api.request(
            "POST",
            path: "/api/auth/register",
            body: RegisterRequest(name: name, email: email, password: password)
        )
    }

    /// Validate current token and get user info
    func me() async throws -> User {
        try await api.request("GET", path: "/api/auth/mobile/me")
    }

    /// Request password reset
    func forgotPassword(email: String) async throws {
        struct ForgotRequest: Codable { let email: String }
        try await api.requestVoid(
            "POST",
            path: "/api/auth/forgot-password",
            body: ForgotRequest(email: email)
        )
    }
}
