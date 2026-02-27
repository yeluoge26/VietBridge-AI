import SwiftUI

struct RiskCard: View {
    let data: ChatResponseData

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 4) {
                Image(systemName: "shield.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(.red)
                Text("风险分析")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.red)
            }

            if let score = data.score {
                HStack {
                    RiskGauge(score: score)
                        .frame(width: 80, height: 80)
                    VStack(alignment: .leading, spacing: 4) {
                        Text(riskLevel(score))
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(scoreColor(score))
                        Text("风险评分 \(score)/100")
                            .font(.system(size: 12))
                            .foregroundStyle(.textSecondary)
                    }
                    Spacer()
                }
            }

            if let situation = data.situation {
                Text(situation)
                    .font(.system(size: 13))
                    .foregroundStyle(.textPrimary)
                    .padding(10)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            if let factors = data.factors, !factors.isEmpty {
                Text("风险因素")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(.textPrimary)
                ForEach(factors) { f in
                    HStack(spacing: 8) {
                        Text(f.label)
                            .font(.system(size: 12))
                            .foregroundStyle(.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        GeometryReader { geo in
                            RoundedRectangle(cornerRadius: 3)
                                .fill(scoreColor(f.weight))
                                .frame(width: geo.size.width * CGFloat(f.weight) / 100)
                        }
                        .frame(width: 60, height: 6)
                    }
                }
            }

            if let tips = data.tips, !tips.isEmpty {
                Text("防范建议")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(.textPrimary)
                ForEach(tips, id: \.self) { tip in
                    Text("• \(tip)")
                        .font(.system(size: 12))
                        .foregroundStyle(.textSecondary)
                }
            }

            if let scripts = data.scripts, !scripts.isEmpty {
                Text("实用话术")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(.textPrimary)
                ForEach(scripts) { s in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(s.vi)
                            .font(.system(size: 14, weight: .medium))
                        Text(s.zh)
                            .font(.system(size: 12))
                            .foregroundStyle(.textSecondary)
                        ActionButtons(text: s.vi)
                    }
                    .padding(8)
                    .background(Color.bgInput)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
        .padding(16)
        .cardStyle()
    }

    private func riskLevel(_ score: Int) -> String {
        if score >= 70 { return "高风险" }
        if score >= 40 { return "中风险" }
        return "低风险"
    }

    private func scoreColor(_ score: Int) -> Color {
        if score >= 70 { return .riskRed }
        if score >= 40 { return .riskOrange }
        return .vbAccent
    }
}

struct RiskGauge: View {
    let score: Int

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.borderLight, lineWidth: 6)
            Circle()
                .trim(from: 0, to: CGFloat(score) / 100)
                .stroke(gaugeColor, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text("\(score)")
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(gaugeColor)
        }
    }

    private var gaugeColor: Color {
        if score >= 70 { return .riskRed }
        if score >= 40 { return .riskOrange }
        return .vbAccent
    }
}
