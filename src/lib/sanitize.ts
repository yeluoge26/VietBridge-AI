// ============================================================================
// VietBridge AI — Input Sanitization for Log Storage
// Masks PII (email, phone, ID numbers, card numbers) in log entries.
// Controlled by LOG_SANITIZE=true environment variable.
// ============================================================================

const ENABLED = () => process.env.LOG_SANITIZE === "true";

// Regex patterns for common PII
const PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // Email addresses
  { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "***@***.***" },
  // Vietnamese phone numbers (10-11 digits, with or without country code)
  { regex: /(?:\+84|0)\d{9,10}/g, replacement: "***电话***" },
  // Chinese phone numbers
  { regex: /(?:\+86)?1[3-9]\d{9}/g, replacement: "***电话***" },
  // Generic international phone (10+ digits with optional + prefix)
  { regex: /\+\d{10,15}/g, replacement: "***电话***" },
  // Chinese ID card (18 digits)
  { regex: /\d{6}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g, replacement: "***证件号***" },
  // Passport numbers (letter + 7-8 digits)
  { regex: /[A-Z]\d{7,8}/g, replacement: "***护照号***" },
  // Bank card numbers (16-19 digits)
  { regex: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4,7}/g, replacement: "***银行卡***" },
];

/**
 * Sanitize text by masking PII patterns.
 * Only active when LOG_SANITIZE=true environment variable is set.
 * Returns the original text unchanged when disabled.
 */
export function sanitizeForLog(text: string): string {
  if (!ENABLED()) return text;

  let sanitized = text;
  for (const { regex, replacement } of PATTERNS) {
    sanitized = sanitized.replace(regex, replacement);
  }
  return sanitized;
}
