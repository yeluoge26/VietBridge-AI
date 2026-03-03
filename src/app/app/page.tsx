'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserInfo {
  id: string;
  userType: 'ANONYMOUS' | 'REGISTERED' | 'VIP' | 'ADMIN';
  dailyQuota: number;
  dailyUsed: number;
  monthlyQuota: number;
  monthlyUsed: number;
}

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取或创建匿名用户
    const initializeUser = async () => {
      try {
        const response = await fetch('/api/auth/anonymous', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // 保存用户 ID 到 localStorage
          localStorage.setItem('anonymousUserId', userData.id);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在初始化应用...</p>
        </div>
      </div>
    );
  }

  const getQuotaPercentage = () => {
    if (!user) return 0;
    return Math.min((user.dailyUsed / user.dailyQuota) * 100, 100);
  };

  const getUserTypeLabel = () => {
    if (!user) return '';
    switch (user.userType) {
      case 'ANONYMOUS':
        return '免费用户';
      case 'REGISTERED':
        return '注册用户';
      case 'VIP':
        return 'VIP 用户';
      case 'ADMIN':
        return '管理员';
      default:
        return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VietBridge AI</h1>
            <p className="text-sm text-gray-500">在越华人智能沟通助手</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {getUserTypeLabel()}
                </p>
                <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
              </div>
            )}
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              登录
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Status Card */}
        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              您的使用配额
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Quota */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    今日使用
                  </span>
                  <span className="text-sm text-gray-600">
                    {user.dailyUsed} / {user.dailyQuota}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${getQuotaPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Monthly Quota */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    本月使用
                  </span>
                  <span className="text-sm text-gray-600">
                    {user.monthlyUsed} / {user.monthlyQuota}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (user.monthlyUsed / user.monthlyQuota) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {user.userType === 'ANONYMOUS' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  💡 登录账户可以获得更多使用次数。
                  <Link
                    href="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700 ml-1"
                  >
                    立即注册
                  </Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Translation */}
          <Link
            href="/app/translate"
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200 hover:border-blue-300"
          >
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
              中越翻译
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              智能翻译中文和越南语，支持多种场景
            </p>
            <div className="mt-4 text-xs text-gray-500">
              {user && (
                <>
                  今日剩余: <span className="font-semibold">{user.dailyQuota - user.dailyUsed}</span> 次
                </>
              )}
            </div>
          </Link>

          {/* Reply Suggestion */}
          <Link
            href="/app/reply"
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200 hover:border-green-300"
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition">
              回复建议
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              获得智能的越南语回复建议，多种风格可选
            </p>
            <div className="mt-4 text-xs text-gray-500">
              {user && (
                <>
                  今日剩余: <span className="font-semibold">{user.dailyQuota - user.dailyUsed}</span> 次
                </>
              )}
            </div>
          </Link>

          {/* Risk Detection */}
          <Link
            href="/app/risk"
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200 hover:border-red-300"
          >
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition">
              风险预警
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              识别潜在风险，保护您的权益
            </p>
            <div className="mt-4 text-xs text-gray-500">
              {user && (
                <>
                  今日剩余: <span className="font-semibold">{user.dailyQuota - user.dailyUsed}</span> 次
                </>
              )}
            </div>
          </Link>

          {/* Document Scan */}
          <Link
            href="/app/scan"
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200 hover:border-purple-300"
          >
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition">
              文档扫描
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              扫描和识别文档中的越南语内容
            </p>
            <div className="mt-4 text-xs text-gray-500">
              {user && (
                <>
                  今日剩余: <span className="font-semibold">{user.dailyQuota - user.dailyUsed}</span> 次
                </>
              )}
            </div>
          </Link>

          {/* Vietnamese Learning */}
          <Link
            href="/app/learn"
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-200 hover:border-yellow-300"
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition">
              越南语学习
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              学习越南语课程，提升语言能力
            </p>
            <div className="mt-4 text-xs text-gray-500">
              {user && (
                <>
                  今日剩余: <span className="font-semibold">{user.dailyQuota - user.dailyUsed}</span> 次
                </>
              )}
            </div>
          </Link>

          {/* Pricing */}
          <Link
            href="/pricing"
            className="group bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md hover:shadow-lg transition p-6 border border-blue-400 text-white"
          >
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold group-hover:text-blue-100 transition">
              升级 VIP
            </h3>
            <p className="text-sm text-blue-100 mt-2">
              无限使用次数，解锁高级功能
            </p>
            <div className="mt-4 text-xs text-blue-200">
              立即升级获得更多权益
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            关于 VietBridge AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎯 智能翻译</h3>
              <p className="text-sm text-gray-600">
                基于 AI 的精准翻译，理解文化背景和语境
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🛡️ 风险预警</h3>
              <p className="text-sm text-gray-600">
                识别合同陷阱、诈骗信息，保护您的权益
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📖 语言学习</h3>
              <p className="text-sm text-gray-600">
                系统化的越南语课程，从入门到精通
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
