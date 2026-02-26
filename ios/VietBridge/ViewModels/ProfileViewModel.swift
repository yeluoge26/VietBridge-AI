// ============================================================================
// VietBridge AI — Profile View Model
// Usage stats, subscription, sign out
// ============================================================================

import SwiftUI

@Observable
@MainActor
final class ProfileViewModel {
    var usage: UsageData?
    var subscription: SubscriptionData?
    var isLoading = false
    var errorMessage: String?

    private let usageService = UsageService()

    func load() async {
        isLoading = true
        do {
            async let u = usageService.getUsage()
            async let s = usageService.getSubscription()
            usage = try await u
            subscription = try await s
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    var usagePercent: Double {
        guard let usage, usage.limit > 0 else { return 0 }
        return Double(usage.used) / Double(usage.limit)
    }

    var plans: [Plan] {
        Plan.plans(currentPlan: subscription?.plan ?? "FREE")
    }
}
