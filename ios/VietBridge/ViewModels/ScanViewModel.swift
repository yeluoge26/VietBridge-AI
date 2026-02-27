import Foundation
import Vision
import UIKit

@Observable
@MainActor
final class ScanViewModel {
    var image: UIImage?
    var ocrText = ""
    var ocrLoading = false
    var analyzeLoading = false
    var documentType: DocumentType = .menu
    var analysisResult: OcrAnalysisResult?
    var error: String?

    enum DocumentType: String, CaseIterable {
        case menu = "menu"
        case receipt = "receipt"
        case contract = "contract"

        var label: String {
            switch self {
            case .menu: "菜单"
            case .receipt: "收据/账单"
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

    func performOCR(on uiImage: UIImage) {
        image = uiImage
        ocrText = ""
        analysisResult = nil
        error = nil
        ocrLoading = true

        Task.detached { [weak self] in
            guard let cgImage = uiImage.cgImage else {
                await MainActor.run { self?.ocrLoading = false; self?.error = "无法读取图片" }
                return
            }

            let request = VNRecognizeTextRequest()
            request.recognitionLanguages = ["vi-VN", "en-US", "zh-Hans"]
            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = true

            let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            do {
                try handler.perform([request])
                let observations = request.results ?? []
                let text = observations
                    .compactMap { $0.topCandidates(1).first?.string }
                    .joined(separator: "\n")

                await MainActor.run {
                    self?.ocrText = text
                    self?.ocrLoading = false
                }
            } catch {
                await MainActor.run {
                    self?.error = "OCR识别失败: \(error.localizedDescription)"
                    self?.ocrLoading = false
                }
            }
        }
    }

    func analyzeText() {
        guard !ocrText.isEmpty else { return }
        analyzeLoading = true
        error = nil

        Task {
            do {
                let body = OcrAnalyzeRequest(ocrText: ocrText, documentType: documentType.rawValue)
                let result: OcrAnalysisResult = try await APIClient.shared.post("/api/ocr/analyze", body: body)
                analysisResult = result
            } catch {
                self.error = "分析失败: \(error.localizedDescription)"
            }
            analyzeLoading = false
        }
    }

    func reset() {
        image = nil
        ocrText = ""
        analysisResult = nil
        error = nil
        ocrLoading = false
        analyzeLoading = false
    }
}

// MARK: - Models

struct OcrAnalyzeRequest: Encodable {
    let ocrText: String
    let documentType: String
}

struct OcrAnalysisResult: Codable {
    let type: String?
    let documentType: String?
    let data: OcrAnalysisData?
}

struct OcrAnalysisData: Codable {
    let summaryZh: String?
    let items: [OcrItem]?
    let warnings: [String]?
    let totalEstimate: String?
}

struct OcrItem: Codable, Identifiable {
    var id: String { (nameVi ?? "") + (nameZh ?? "") + (price ?? "") }
    let nameVi: String?
    let nameZh: String?
    let price: String?
    let priceReasonable: Bool?
}
