"use client";

// ============================================================================
// VietBridge AI V2 — Scan Page
// Image upload → Tesseract.js OCR → AI analysis → Result display
// Supports: menu, receipt, contract document types
// ============================================================================

import { useState, useRef, useCallback } from "react";
import { useOcr } from "@/hooks/useOcr";

type DocType = "menu" | "receipt" | "contract";

const DOC_TYPES: { id: DocType; label: string; icon: string; desc: string }[] = [
  { id: "menu", label: "菜单", icon: "\uD83C\uDF7D\uFE0F", desc: "识别菜品和价格" },
  { id: "receipt", label: "收据", icon: "\uD83E\uDDFE", desc: "核对消费明细" },
  { id: "contract", label: "合同", icon: "\uD83D\uDCC4", desc: "分析条款风险" },
];

export default function ScanPage() {
  const [step, setStep] = useState<"upload" | "ocr" | "analyzing" | "result">("upload");
  const [docType, setDocType] = useState<DocType>("menu");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { result, loading, error, analyze, reset } = useOcr();

  // ── Handle image selection ─────────────────────────────────────────────
  const handleImageSelect = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep("ocr");
    setOcrProgress(0);

    try {
      // Dynamic import to avoid SSR issues
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("vie+eng", undefined, {
        logger: (m: { progress: number }) => {
          if (m.progress) setOcrProgress(Math.round(m.progress * 100));
        },
      });

      const ret = await worker.recognize(file);
      setOcrText(ret.data.text);
      await worker.terminate();

      setStep("analyzing");

      // Auto-analyze
      await analyze(ret.data.text, docType);
      setStep("result");
    } catch (err) {
      console.error("OCR error:", err);
      setOcrText("");
      setStep("upload");
    }
  }, [docType, analyze]);

  // ── Handle file input ──────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }

  // ── Reset ──────────────────────────────────────────────────────────────
  function handleReset() {
    setStep("upload");
    setImageUrl(null);
    setOcrText("");
    setOcrProgress(0);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-1 flex-col bg-[#F8F7F5]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-[#111]">文档扫描</h1>
        <p className="text-xs text-[#999]">拍照或上传文档，AI帮你分析</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {/* ── Step: Upload ────────────────────────────────────────────── */}
        {step === "upload" && (
          <div className="space-y-4 pt-2">
            {/* Document type selector */}
            <div>
              <p className="mb-2 text-sm font-medium text-[#111]">文档类型</p>
              <div className="grid grid-cols-3 gap-2">
                {DOC_TYPES.map((dt) => (
                  <button
                    key={dt.id}
                    onClick={() => setDocType(dt.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      docType === dt.id
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-[#EDEDED] bg-white text-[#111] hover:bg-[#F8F7F5]"
                    }`}
                  >
                    <span className="text-xl">{dt.icon}</span>
                    <span className="text-xs font-medium">{dt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#DDD] bg-white p-8 transition-colors hover:border-[#999] hover:bg-[#FAFAFA]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F1EF]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#111]">点击上传图片</p>
                <p className="text-xs text-[#999]">支持 JPG, PNG, WEBP</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Camera button (mobile) */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "environment");
                  fileInputRef.current.click();
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              拍照扫描
            </button>
          </div>
        )}

        {/* ── Step: OCR Processing ────────────────────────────────────── */}
        {step === "ocr" && (
          <div className="flex flex-col items-center gap-4 pt-8">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="扫描图片"
                className="h-48 w-auto rounded-xl border border-[#EDEDED] object-cover"
              />
            )}
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[#111]">文字识别中...</span>
                <span className="text-xs text-[#999]">{ocrProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#EDEDED]">
                <div
                  className="h-full rounded-full bg-[#111] transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Analyzing ─────────────────────────────────────────── */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#EDEDED] border-t-[#111]" />
            <p className="text-sm text-[#666]">AI正在分析文档...</p>
          </div>
        )}

        {/* ── Step: Result ────────────────────────────────────────────── */}
        {step === "result" && (
          <div className="space-y-4 pt-2">
            {/* Preview */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="扫描图片"
                className="h-32 w-auto rounded-xl border border-[#EDEDED] object-cover"
              />
            )}

            {/* OCR Text */}
            {ocrText && (
              <div className="rounded-xl border border-[#EDEDED] bg-white p-4">
                <p className="mb-2 text-xs font-semibold text-[#999]">识别文字</p>
                <p className="max-h-32 overflow-y-auto text-sm text-[#666] whitespace-pre-wrap">
                  {ocrText}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* AI Analysis Result */}
            {result && (
              <div className="rounded-xl border border-[#EDEDED] bg-white p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{DOC_TYPES.find((d) => d.id === docType)?.icon}</span>
                  <span className="text-sm font-bold text-[#111]">
                    {DOC_TYPES.find((d) => d.id === docType)?.label}分析结果
                  </span>
                </div>

                {/* Items */}
                {result.data?.items && Array.isArray(result.data.items) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#999]">识别项目</p>
                    {result.data.items.map((item: { name?: string; name_vi?: string; name_zh?: string; price?: string; unit?: string; note?: string; priceReasonable?: boolean }, i: number) => (
                      <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 ${item.priceReasonable === false ? "bg-red-50" : "bg-[#F2F1EF]"}`}>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-[#111]">{item.name_zh || item.name_vi || item.name || item.note}</span>
                          {item.name_vi && item.name_zh && (
                            <span className="ml-1 text-xs text-[#999]">({item.name_vi})</span>
                          )}
                        </div>
                        {item.price && (
                          <span className={`ml-2 text-sm font-medium ${item.priceReasonable === false ? "text-red-600" : "text-[#2E7D32]"}`}>
                            {item.price}{item.unit ? `/${item.unit}` : ""}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary */}
                {(result.data?.summary || result.data?.summary_zh) && (
                  <div className="rounded-lg bg-blue-50 px-3 py-2">
                    <p className="text-xs text-blue-700">{result.data.summary || result.data.summary_zh}</p>
                  </div>
                )}

                {/* Total estimate */}
                {result.data?.totalEstimate && (
                  <div className="flex items-center justify-between rounded-lg bg-[#F2F1EF] px-3 py-2">
                    <span className="text-xs font-semibold text-[#111]">预估总价</span>
                    <span className="text-sm font-bold text-[#2E7D32]">{result.data.totalEstimate}</span>
                  </div>
                )}

                {/* Warnings */}
                {result.data?.warnings && Array.isArray(result.data.warnings) && result.data.warnings.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-orange-600">注意事项</p>
                    {result.data.warnings.map((w: string, i: number) => (
                      <div key={i} className="rounded-lg bg-orange-50 px-3 py-2">
                        <p className="text-xs text-orange-700">{w}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tips */}
                {result.data?.tips && Array.isArray(result.data.tips) && result.data.tips.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#2E7D32]">建议</p>
                    {result.data.tips.map((tip: string, i: number) => (
                      <p key={i} className="text-xs text-[#666]">{i + 1}. {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EDEDED] border-t-[#111]" />
              </div>
            )}

            {/* Re-scan button */}
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDD] bg-white py-3 text-sm font-medium text-[#111] transition-colors hover:bg-[#F8F7F5]"
            >
              重新扫描
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
