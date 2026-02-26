// ============================================================================
// VietBridge AI — Color Theme
// Matches web app color palette
// ============================================================================

import SwiftUI

extension Color {
    // Background colors (matching web #F8F7F5 / #111)
    static let bgPrimary = Color(red: 248/255, green: 247/255, blue: 245/255)
    static let bgCard = Color.white
    static let bgInput = Color(red: 245/255, green: 244/255, blue: 242/255)

    // Text colors
    static let textPrimary = Color(red: 17/255, green: 17/255, blue: 17/255)
    static let textSecondary = Color(red: 136/255, green: 136/255, blue: 136/255)
    static let textTertiary = Color(red: 170/255, green: 170/255, blue: 170/255)

    // Accent & status colors
    static let accentGreen = Color(red: 57/255, green: 209/255, blue: 115/255)
    static let riskRed = Color(red: 239/255, green: 68/255, blue: 68/255)
    static let riskOrange = Color(red: 249/255, green: 115/255, blue: 22/255)
    static let riskYellow = Color(red: 234/255, green: 179/255, blue: 8/255)

    // Card type accent colors
    static let translationAccent = Color(red: 99/255, green: 102/255, blue: 241/255)
    static let replyAccent = Color(red: 16/255, green: 185/255, blue: 129/255)
    static let riskAccent = Color(red: 239/255, green: 68/255, blue: 68/255)
    static let teachAccent = Color(red: 245/255, green: 158/255, blue: 11/255)

    // Border
    static let borderLight = Color(red: 229/255, green: 229/255, blue: 229/255)
}

extension ShapeStyle where Self == Color {
    static var bgPrimary: Color { .bgPrimary }
    static var textPrimary: Color { .textPrimary }
    static var textSecondary: Color { .textSecondary }
}
