import { buildHeaders } from "./client";

const API_BASE = import.meta.env.VITE_API_BASE || "";

/**
 * Call server-side TTS API (DashScope CosyVoice) and play the audio.
 * Returns true on success, false on failure.
 */
export async function speakViaApi(
  text: string,
  lang: "zh" | "vi"
): Promise<boolean> {
  try {
    const headers = buildHeaders();
    const res = await fetch(API_BASE + "/api/tts", {
      method: "POST",
      headers,
      body: JSON.stringify({ text, lang }),
    });

    if (!res.ok) return false;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Audio playback failed"));
      };
      audio.play().catch(reject);
    });

    return true;
  } catch {
    return false;
  }
}
