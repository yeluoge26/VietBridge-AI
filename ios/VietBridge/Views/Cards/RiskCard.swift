// ============================================================================
// VietBridge AI — Risk Card
// Risk assessment gauge + factors + tips + scripts
// ============================================================================

import SwiftUI

struct RiskCard: View {
    let data: RiskData

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Label("风险评估", systemImage: "shield.checkered")
                .font(.caption.bold())
                .foregroundStyle(.riskAccent)

            // Gauge
            if let score = data.score {
                HStack {
                    Spacer()
                    RiskGauge(score: score, level: data.level ?? "unknown")
                    Spacer()
                }
            }

            // Factors
            if let factors = data.factors, !factors.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("风险因素")
                        .font(.caption.bold())
                        .foregroundStyle(.textSecondary)
                    ForEach(factors) { factor in
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(Color.riskOrange)
                                .frame(width: 6, height: 6)
                                .padding(.top, 6)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(factor.label)
                                    .font(.subheadline.bold())
                                if let detail = factor.detail {
                                    Text(detail)
                                        .font(.caption)
                                        .foregroundStyle(.textSecondary)
                                }
                            }
                        }
                    }
                }
            }

            // Tips
            if let tips = data.tips, !tips.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("防护建议")
                        .font(.caption.bold())
                        .foregroundStyle(.textSecondary)
                    ForEach(tips, id: \.self) { tip in
                        HStack(alignment: .top, spacing: 6) {
                            Image(systemName: "lightbulb.fill")
                                .font(.caption2)
                                .foregroundStyle(.riskYellow)
                            Text(tip)
                                .font(.caption)
                                .foregroundStyle(.textPrimary)
                        }
                    }
                }
            }

            // Scripts
            if let scripts = data.scripts, !scripts.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("应对话术")
                        .font(.caption.bold())
                        .foregroundStyle(.textSecondary)
                    ForEach(scripts) { script in
                        VStack(alignment: .leading, spacing: 4) {
                            if let situation = script.situation {
                                Text(situation)
                                    .font(.caption2)
                                    .foregroundStyle(.textTertiary)
                            }
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(script.vi)
                                        .font(.subheadline.bold())
                                    Text(script.zh)
                                        .font(.caption)
                                        .foregroundStyle(.textSecondary)
                                }
                                Spacer()
                                Button {
                                    TTSService.shared.speakVietnamese(script.vi)
                                } label: {
                                    Image(systemName: "speaker.wave.2")
                                        .font(.caption)
                                        .foregroundStyle(.textTertiary)
                                }
                            }
                        }
                        .padding(8)
                        .background(Color.bgInput)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }
        }
        .padding(16)
        .cardStyle()
    }
}
