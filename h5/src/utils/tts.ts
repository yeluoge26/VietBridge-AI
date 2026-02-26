import { speakViaApi } from "../api/tts";

/**
 * Speak text using API TTS (DashScope CosyVoice) first,
 * falls back to browser Web Speech API on failure.
 */
export async function speak(text: string, lang: "vi-VN" | "zh-CN" = "vi-VN"): Promise<void> {
  const apiLang = lang === "zh-CN" ? "zh" : "vi";

  // Try API TTS first
  const ok = await speakViaApi(text, apiLang);
  if (ok) return;

  // Fallback to browser Web Speech API
  speakBrowser(text, lang);
}

function speakBrowser(text: string, lang: "vi-VN" | "zh-CN"): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
  if (match) utterance.voice = match;
  window.speechSynthesis.speak(utterance);
}

export function isTtsAvailable(): boolean {
  return true; // API TTS is always available as primary, browser as fallback
}

export async function shareText(text: string, title?: string): Promise<boolean> {
  if (navigator.share) {
    try { await navigator.share({ title: title || "VietBridge AI", text }); return true; }
    catch { return false; }
  }
  if (navigator.clipboard) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { return false; }
  }
  return false;
}
