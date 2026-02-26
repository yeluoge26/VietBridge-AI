// ============================================================================
// VietBridge AI — Scan View Model
// OCR workflow: capture → recognize → analyze → display
// ============================================================================

import SwiftUI
import PhotosUI

@Observable
@MainActor
final class ScanViewModel {
    enum State {
        case idle
        case recognizing
        case analyzing
        case result
        case error(String)
    }

    var state: State = .idle
    var selectedImage: UIImage?
    var ocrText = ""
    var documentType: DocumentType = .menu
    var result: OcrAnalyzeResponse?

    private let scanService = ScanService()

    func processImage(_ image: UIImage) async {
        selectedImage = image
        state = .recognizing

        do {
            ocrText = try await ScanService.recognizeText(from: image)
            if ocrText.isEmpty {
                state = .error("未能识别到文字，请重新拍照")
                return
            }
            state = .analyzing
            result = try await scanService.analyze(ocrText: ocrText, documentType: documentType)
            state = .result
        } catch {
            state = .error(error.localizedDescription)
        }
    }

    func reset() {
        state = .idle
        selectedImage = nil
        ocrText = ""
        result = nil
    }
}
