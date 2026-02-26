// ============================================================================
// VietBridge AI — Scan/OCR Service
// OCR text extraction + API analysis
// ============================================================================

import Foundation
import Vision
import UIKit

struct ScanService: Sendable {
    private let api = APIClient.shared

    /// Perform OCR on an image using Apple Vision framework
    static func recognizeText(from image: UIImage) async throws -> String {
        guard let cgImage = image.cgImage else {
            throw APIError.badRequest("无法处理图片")
        }

        return try await withCheckedThrowingContinuation { continuation in
            let request = VNRecognizeTextRequest { request, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                let observations = request.results as? [VNRecognizedTextObservation] ?? []
                let text = observations
                    .compactMap { $0.topCandidates(1).first?.string }
                    .joined(separator: "\n")

                continuation.resume(returning: text)
            }

            request.recognitionLanguages = ["vi-VN", "zh-Hans", "en-US"]
            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = true

            let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
            do {
                try handler.perform([request])
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }

    /// Send OCR text to backend for analysis
    func analyze(ocrText: String, documentType: DocumentType) async throws -> OcrAnalyzeResponse {
        try await api.request(
            "POST",
            path: "/api/ocr/analyze",
            body: OcrAnalyzeRequest(ocrText: ocrText, documentType: documentType.rawValue)
        )
    }
}
