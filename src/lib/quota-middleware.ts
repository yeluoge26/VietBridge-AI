import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 获取用户 ID（从 Cookie 或 Session）
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  // 首先尝试从 Cookie 获取匿名用户 ID
  const anonymousId = request.cookies.get('anonymousUserId')?.value;
  if (anonymousId) {
    return anonymousId;
  }

  // 如果需要，可以从 Session 获取登录用户 ID
  // const session = await getServerSession();
  // if (session?.user?.id) {
  //   return session.user.id;
  // }

  return null;
}

/**
 * 检查用户是否超过配额
 */
export async function checkQuota(
  userId: string,
  taskType: string = 'GENERAL'
): Promise<{
  allowed: boolean;
  reason?: string;
  remainingDaily?: number;
  remainingMonthly?: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userType: true,
        dailyQuota: true,
        dailyUsed: true,
        monthlyQuota: true,
        monthlyUsed: true,
        lastResetDay: true,
        banned: true,
      },
    });

    if (!user) {
      return {
        allowed: false,
        reason: 'User not found',
      };
    }

    // 检查用户是否被禁用
    if (user.banned) {
      return {
        allowed: false,
        reason: 'User account is banned',
      };
    }

    // 检查是否需要重置每日配额
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(user.lastResetDay);
    lastReset.setHours(0, 0, 0, 0);

    if (today.getTime() > lastReset.getTime()) {
      // 重置每日配额
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyUsed: 0,
          lastResetDay: new Date(),
        },
      });

      user.dailyUsed = 0;
    }

    // 检查每日配额
    if (user.dailyUsed >= user.dailyQuota) {
      return {
        allowed: false,
        reason: 'Daily quota exceeded',
        remainingDaily: 0,
        remainingMonthly: user.monthlyQuota - user.monthlyUsed,
      };
    }

    // 检查每月配额
    if (user.monthlyUsed >= user.monthlyQuota) {
      return {
        allowed: false,
        reason: 'Monthly quota exceeded',
        remainingDaily: user.dailyQuota - user.dailyUsed,
        remainingMonthly: 0,
      };
    }

    return {
      allowed: true,
      remainingDaily: user.dailyQuota - user.dailyUsed,
      remainingMonthly: user.monthlyQuota - user.monthlyUsed,
    };
  } catch (error) {
    console.error('Error checking quota:', error);
    return {
      allowed: false,
      reason: 'Error checking quota',
    };
  }
}

/**
 * 增加用户的使用计数
 */
export async function incrementUsage(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyUsed: {
          increment: 1,
        },
        monthlyUsed: {
          increment: 1,
        },
      },
    });
    return true;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
}

/**
 * 配额检查中间件
 */
export async function quotaMiddleware(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json(
      { error: 'User not identified' },
      { status: 401 }
    );
  }

  // 检查配额
  const quotaCheck = await checkQuota(userId);

  if (!quotaCheck.allowed) {
    return NextResponse.json(
      {
        error: quotaCheck.reason || 'Quota exceeded',
        remainingDaily: quotaCheck.remainingDaily,
        remainingMonthly: quotaCheck.remainingMonthly,
      },
      { status: 429 } // Too Many Requests
    );
  }

  // 调用处理程序
  const response = await handler(request, userId);

  // 如果响应成功，增加使用计数
  if (response.status === 200) {
    await incrementUsage(userId);
  }

  return response;
}
