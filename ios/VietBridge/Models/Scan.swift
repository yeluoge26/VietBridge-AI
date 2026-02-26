// ============================================================================
// VietBridge AI — Scan/OCR Models
// ============================================================================

import Foundation

enum DocumentType: String, CaseIterable, Identifiable, Sendable {
    case menu
    case receipt
    case contract

    var id: String { rawValue }

    var label: String {
        switch self {
        case .menu: "菜单"
        case .receipt: "收据/小票"
        case .contract: "合同/文件"
        }
    }

    var icon: String {
        switch self {
        case .menu: "menucard"
        case .receipt: "receipt"
        case .contract: "doc.text"
        }
    }
}

struct OcrAnalyzeRequest: Codable, Sendable {
    let ocrText: String
    let documentType: String
}

struct OcrAnalyzeResponse: Codable, Sendable {
    let type: String
    let documentType: String
    let data: OcrResultData
}

struct OcrResultData: Codable, Sendable {
    let items: [OcrItem]?
    let summaryZh: String?
    let totalEstimate: String?
    let warnings: [String]?
    let tips: [String]?
    let raw: String?

    enum CodingKeys: String, CodingKey {
        case items
        case summaryZh = "summary_zh"
        case totalEstimate, warnings, tips, raw
    }
}

struct OcrItem: Codable, Identifiable, Sendable {
    var id: String { nameVi ?? UUID().uuidString }
    let nameVi: String?
    let nameZh: String?
    let price: String?
    let unit: String?
    let priceReasonable: Bool?
    let note: String?

    enum CodingKeys: String, CodingKey {
        case nameVi = "name_vi"
        case nameZh = "name_zh"
        case price, unit, priceReasonable, note
    }
}
