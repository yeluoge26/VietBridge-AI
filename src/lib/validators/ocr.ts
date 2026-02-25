// ============================================================================
// VietBridge AI V2 — OCR Request Validator
// ============================================================================

import { z } from "zod";

export const ocrSchema = z.object({
  ocrText: z.string().min(1).max(10000),
  documentType: z.enum(["menu", "receipt", "contract"]),
  imageUrl: z.string().optional(),
});

export type OcrInput = z.infer<typeof ocrSchema>;
