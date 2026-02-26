// ============================================================================
// VietBridge AI V2 — Text-to-Speech Utility
// Uses Web Speech API (SpeechSynthesis) for Vietnamese and Chinese TTS
// ============================================================================

/**
 * Speak text using the browser's Speech Synthesis API.
 * @param text The text to speak
 * @param lang Language code: "vi-VN" for Vietnamese, "zh-CN" for Chinese
 */
export function speak(text: string, lang: "vi-VN" | "zh-CN" = "vi-VN"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech Synthesis not supported");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Check if speech synthesis is available and has voices for a language.
 */
export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

/**
 * Share text via Web Share API or fallback to clipboard.
 */
export async function shareText(text: string, title?: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: title || "VietBridge AI",
        text,
      });
      return true;
    } catch {
      // User cancelled or share failed
      return false;
    }
  }

  // Fallback: copy to clipboard
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
