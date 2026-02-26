import { apiPost } from "./client";

export function analyzeOcr<T>(ocrText: string, documentType: string): Promise<T> {
  return apiPost<T>("/api/ocr/analyze", { ocrText, documentType });
}
