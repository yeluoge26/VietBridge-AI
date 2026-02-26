// ============================================================================
// VietBridge AI — Profile Tab
// User info, usage stats, subscription management
// ============================================================================

import SwiftUI
import SafariServices

struct ProfileTab: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = ProfileViewModel()
    @State private var showSignOutAlert = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // User info
                    userInfoCard

                    // Usage
                    if let usage = viewModel.usage {
                        usageCard(usage)
                    }

                    // Plans
                    plansSection

                    // Sign out
                    Button(role: .destructive) {
                        showSignOutAlert = true
                    } label: {
                        Text("退出登录")
                            .font(.body.bold())
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color.bgCard)
                            .foregroundStyle(.riskRed)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.riskRed.opacity(0.2), lineWidth: 1)
                            )
                    }

                    // Version
                    Text("VietBridge AI v1.0.0")
                        .font(.caption)
                        .foregroundStyle(.textTertiary)
                }
                .padding(16)
            }
            .background(Color.bgPrimary)
            .navigationTitle("我的")
            .navigationBarTitleDisplayMode(.inline)
            .task { await viewModel.load() }
            .refreshable { await viewModel.load() }
            .alert("确认退出", isPresented: $showSignOutAlert) {
                Button("取消", role: .cancel) {}
                Button("退出", role: .destructive) {
                    appState.signOut()
                }
            } message: {
                Text("退出后需要重新登录")
            }
        }
    }

    // MARK: - User Info

    private var userInfoCard: some View {
        HStack(spacing: 16) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 48))
                .foregroundStyle(.textTertiary)

            VStack(alignment: .leading, spacing: 4) {
                Text(appState.currentUser?.displayName ?? "用户")
                    .font(.headline)
                    .foregroundStyle(.textPrimary)
                Text(appState.currentUser?.email ?? "")
                    .font(.caption)
                    .foregroundStyle(.textSecondary)
                Text(planBadge)
                    .font(.caption2.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Color.accent.opacity(0.1))
                    .foregroundStyle(.accent)
                    .clipShape(Capsule())
            }
            Spacer()
        }
        .padding(16)
        .cardStyle()
    }

    private var planBadge: String {
        switch viewModel.subscription?.plan ?? "FREE" {
        case "PRO": "专业版"
        case "ENTERPRISE": "企业版"
        default: "免费版"
        }
    }

    // MARK: - Usage Card

    private func usageCard(_ usage: UsageData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("今日用量")
                    .font(.headline)
                Spacer()
                Text("\(usage.used) / \(usage.limit)")
                    .font(.subheadline.bold())
                    .foregroundStyle(usageColor(usage))
            }

            ProgressView(value: viewModel.usagePercent)
                .tint(usageColor(usage))

            if !usage.allowed {
                Text("今日额度已用完，升级获取更多次数")
                    .font(.caption)
                    .foregroundStyle(.riskOrange)
            }
        }
        .padding(16)
        .cardStyle()
    }

    private func usageColor(_ usage: UsageData) -> Color {
        let pct = viewModel.usagePercent
        if pct >= 0.9 { return .riskRed }
        if pct >= 0.7 { return .riskOrange }
        return .accentGreen
    }

    // MARK: - Plans

    private var plansSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("订阅计划")
                .font(.headline)
                .padding(.horizontal, 4)

            ForEach(viewModel.plans) { plan in
                planCard(plan)
            }
        }
    }

    private func planCard(_ plan: Plan) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(plan.name)
                    .font(.headline)
                Spacer()
                Text(plan.price)
                    .font(.subheadline.bold())
                    .foregroundStyle(.accent)
            }

            ForEach(plan.features, id: \.self) { feature in
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(.accentGreen)
                    Text(feature)
                        .font(.caption)
                        .foregroundStyle(.textSecondary)
                }
            }

            if !plan.isCurrent, plan.priceId != nil {
                Button {
                    Task { await upgrade(plan) }
                } label: {
                    Text("升级")
                        .font(.body.bold())
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.textPrimary)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            } else if plan.isCurrent {
                Text("当前计划")
                    .font(.caption.bold())
                    .foregroundStyle(.accentGreen)
            }
        }
        .padding(16)
        .cardStyle()
    }

    private func upgrade(_ plan: Plan) async {
        guard let priceId = plan.priceId else { return }
        do {
            let url = try await UsageService().createCheckout(priceId: priceId)
            if let checkoutURL = URL(string: url) {
                await UIApplication.shared.open(checkoutURL)
            }
        } catch {}
    }
}
