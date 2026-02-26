// ============================================================================
// VietBridge AI — Usage & Subscription Service
// ============================================================================

import Foundation

struct UsageService: Sendable {
    private let api = APIClient.shared

    func getUsage() async throws -> UsageData {
        try await api.request("GET", path: "/api/usage")
    }

    func getSubscription() async throws -> SubscriptionData {
        try await api.request("GET", path: "/api/subscription")
    }

    struct CheckoutResponse: Codable { let url: String }

    func createCheckout(priceId: String) async throws -> String {
        struct Body: Codable { let priceId: String }
        let response: CheckoutResponse = try await api.request(
            "POST",
            path: "/api/stripe/checkout",
            body: Body(priceId: priceId)
        )
        return response.url
    }

    func createPortalSession() async throws -> String {
        let response: CheckoutResponse = try await api.request(
            "POST",
            path: "/api/stripe/portal"
        )
        return response.url
    }
}
