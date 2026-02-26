// ============================================================================
// VietBridge AI — TTS Service
// Text-to-Speech using AVSpeechSynthesizer
// ============================================================================

import AVFoundation

@MainActor
final class TTSService {
    static let shared = TTSService()

    private let synthesizer = AVSpeechSynthesizer()

    private init() {
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
    }

    func speak(_ text: String, language: String = "zh-CN") {
        synthesizer.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language)
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.9
        utterance.pitchMultiplier = 1.0
        synthesizer.speak(utterance)
    }

    func speakVietnamese(_ text: String) {
        speak(text, language: "vi-VN")
    }

    func speakChinese(_ text: String) {
        speak(text, language: "zh-CN")
    }

    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
    }

    var isSpeaking: Bool {
        synthesizer.isSpeaking
    }
}
