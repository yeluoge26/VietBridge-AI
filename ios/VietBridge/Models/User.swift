// ============================================================================
// VietBridge AI — User Models
// ============================================================================

import Foundation

struct User: Codable, Identifiable, Sendable {
    let id: String
    let name: String?
    let email: String?
    let role: String
    let image: String?

    var isPro: Bool {
        role == "pro" || role == "admin"
    }

    var displayName: String {
        name ?? email ?? "用户"
    }
}

struct AuthResponse: Codable, Sendable {
    let token: String
    let user: User
}

struct RegisterRequest: Codable, Sendable {
    let name: String
    let email: String
    let password: String
}
