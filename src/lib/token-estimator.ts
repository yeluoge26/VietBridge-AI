// ============================================================================
// VietBridge AI V2 - CJK-Aware Token Estimator
// Estimates token count for mixed Chinese/Vietnamese/English text
// ============================================================================

/**
 * CJK Unified Ideographs range detection.
 * Includes CJK Unified Ideographs, Extension A, and common CJK symbols.
 */
function isCJKChar(charCode: number): boolean {
  return (
    // CJK Unified Ideographs
    (charCode >= 0x4e00 && charCode <= 0x9fff) ||
    // CJK Unified Ideographs Extension A
    (charCode >= 0x3400 && charCode <= 0x4dbf) ||
    // CJK Compatibility Ideographs
    (charCode >= 0xf900 && charCode <= 0xfaff) ||
    // CJK Unified Ideographs Extension B
    (charCode >= 0x20000 && charCode <= 0x2a6df) ||
    // Hiragana
    (charCode >= 0x3040 && charCode <= 0x309f) ||
    // Katakana
    (charCode >= 0x30a0 && charCode <= 0x30ff) ||
    // CJK Symbols and Punctuation
    (charCode >= 0x3000 && charCode <= 0x303f) ||
    // Fullwidth Forms
    (charCode >= 0xff00 && charCode <= 0xffef)
  );
}

/**
 * Vietnamese diacritical character detection.
 * Vietnamese characters with diacritical marks tend to use more tokens
 * than standard ASCII letters.
 */
function isVietnameseAccented(charCode: number): boolean {
  return (
    // Latin Extended Additional (Vietnamese-specific)
    (charCode >= 0x1e00 && charCode <= 0x1eff) ||
    // Latin Extended-A and B (various accented chars)
    (charCode >= 0x0100 && charCode <= 0x024f) ||
    // Combining Diacritical Marks
    (charCode >= 0x0300 && charCode <= 0x036f)
  );
}

/**
 * Estimate the number of tokens in a text string.
 *
 * Estimation rules:
 * - CJK characters: ~2 tokens each (CJK characters are typically split into
 *   multiple subword tokens by BPE tokenizers)
 * - Vietnamese accented characters: ~1 token each
 * - Standard ASCII/Latin characters: ~0.25 tokens each (roughly 4 chars per token)
 * - Whitespace and punctuation: ~0.25 tokens each
 *
 * This is an approximation. Actual token counts depend on the specific
 * tokenizer used by each model.
 *
 * @param text - The input text to estimate tokens for
 * @returns Estimated token count (minimum 1)
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  let tokens = 0;

  for (let i = 0; i < text.length; i++) {
    const charCode = text.codePointAt(i)!;

    // Handle surrogate pairs (characters outside BMP)
    if (charCode > 0xffff) {
      i++; // Skip the second code unit of the surrogate pair
      tokens += 2; // CJK Extension B chars
      continue;
    }

    if (isCJKChar(charCode)) {
      tokens += 2;
    } else if (isVietnameseAccented(charCode)) {
      tokens += 1;
    } else {
      tokens += 0.25;
    }
  }

  // Round up and ensure minimum of 1 for non-empty text
  return Math.max(1, Math.ceil(tokens));
}

/**
 * Estimate token count for an array of messages (e.g., conversation history).
 * Adds overhead for message framing (~4 tokens per message).
 */
export function estimateConversationTokens(
  messages: Array<{ role: string; content: string }>
): number {
  let total = 0;

  for (const message of messages) {
    // ~4 tokens overhead per message (role, delimiters, etc.)
    total += 4;
    total += estimateTokens(message.content);
  }

  // ~2 tokens for conversation framing
  total += 2;

  return total;
}
