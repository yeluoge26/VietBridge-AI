// ============================================================================
// VietBridge AI — Risk Gauge
// Circular progress indicator for risk score
// ============================================================================

import SwiftUI

struct RiskGauge: View {
    let score: Int
    let level: String

    private var color: Color {
        switch score {
        case 0..<30: .accentGreen
        case 30..<60: .riskYellow
        case 60..<80: .riskOrange
        default: .riskRed
        }
    }

    private var levelLabel: String {
        switch level.lowercased() {
        case "safe": "安全"
        case "low": "低风险"
        case "medium": "中风险"
        case "high": "高风险"
        case "critical": "极高风险"
        default: "未知"
        }
    }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                // Background circle
                Circle()
                    .stroke(Color.bgInput, lineWidth: 10)
                    .frame(width: 100, height: 100)

                // Progress arc
                Circle()
                    .trim(from: 0, to: CGFloat(score) / 100)
                    .stroke(color, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                    .frame(width: 100, height: 100)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeOut(duration: 0.8), value: score)

                // Score text
                VStack(spacing: 2) {
                    Text("\(score)")
                        .font(.title.bold())
                        .foregroundStyle(color)
                    Text("/ 100")
                        .font(.caption2)
                        .foregroundStyle(.textTertiary)
                }
            }

            Text(levelLabel)
                .font(.footnote.bold())
                .foregroundStyle(color)
        }
    }
}
