import { useState, useCallback } from "react";
import { analyzeOcr } from "@/api/ocr";

interface OcrResult {
  type: string;
  documentType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  model: string;
}

export function useOcr() {
  const [result, setResult] = useState<OcrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (ocrText: string, documentType: "menu" | "receipt" | "contract") => {
      if (!ocrText.trim() || loading) return;
      setLoading(true);
      setError(null);
      try {
        const data = await analyzeOcr<OcrResult>(ocrText, documentType);
        setResult(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "未知错误";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, analyze, reset };
}
