'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TranslatePage() {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('请输入要翻译的文本');
      return;
    }

    setLoading(true);
    setError('');
    setTranslated('');

    try {
      const response = await fetch('/api/app/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
        }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setError(
          `配额已用尽。剩余今日次数: ${data.remainingDaily}, 剩余本月次数: ${data.remainingMonthly}`
        );
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || '翻译失败，请重试');
        return;
      }

      const data = await response.json();
      setTranslated(data.translated);
      // 更新剩余配额
      if (data.remainingDaily !== undefined) {
        setRemainingQuota(data.remainingDaily);
      }
    } catch (err) {
      setError('网络错误，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    setTargetLanguage(targetLanguage === 'vi' ? 'zh' : 'vi');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <Link href="/app" className="text-gray-600 hover:text-gray-900">
              ← 返回
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">中越翻译</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quota Info */}
        {remainingQuota !== null && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              今日剩余使用次数: <span className="font-semibold">{remainingQuota}</span>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Translation Box */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Source */}
            <div className="p-6 border-r border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {targetLanguage === 'vi' ? '中文' : '越南语'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入要翻译的文本..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                字数: {text.length}
              </p>
            </div>

            {/* Target */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {targetLanguage === 'vi' ? '越南语' : '中文'}
              </label>
              <textarea
                value={translated}
                readOnly
                placeholder="翻译结果将显示在这里..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg bg-gray-50 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                字数: {translated.length}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
            <button
              onClick={handleSwapLanguages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              🔄 交换语言
            </button>

            <button
              onClick={handleTranslate}
              disabled={loading || !text.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '翻译中...' : '翻译'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">💡 使用提示</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 支持中文到越南语的翻译，以及越南语到中文的翻译</li>
            <li>• 翻译结果基于 AI 模型，可能需要人工审核</li>
            <li>• 每次翻译都会消耗一次使用配额</li>
            <li>• 登录用户可以获得更多使用次数</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
