import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserType, PlanType } from '@prisma/client';

/**
 * POST /api/auth/anonymous
 * 创建或获取匿名用户
 */
export async function POST(request: NextRequest) {
  try {
    // 检查是否已有匿名用户 ID
    const anonymousId = request.cookies.get('anonymousUserId')?.value;

    if (anonymousId) {
      // 尝试获取现有用户
      const existingUser = await prisma.user.findUnique({
        where: { id: anonymousId },
        select: {
          id: true,
          userType: true,
          dailyQuota: true,
          dailyUsed: true,
          monthlyQuota: true,
          monthlyUsed: true,
          lastResetDay: true,
        },
      });

      if (existingUser) {
        // 检查是否需要重置每日配额
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastReset = new Date(existingUser.lastResetDay);
        lastReset.setHours(0, 0, 0, 0);

        if (today.getTime() > lastReset.getTime()) {
          // 重置每日配额
          await prisma.user.update({
            where: { id: anonymousId },
            data: {
              dailyUsed: 0,
              lastResetDay: new Date(),
            },
          });

          return NextResponse.json(
            {
              id: existingUser.id,
              userType: existingUser.userType,
              dailyQuota: existingUser.dailyQuota,
              dailyUsed: 0,
              monthlyQuota: existingUser.monthlyQuota,
              monthlyUsed: existingUser.monthlyUsed,
            },
            {
              status: 200,
              headers: {
                'Set-Cookie': `anonymousUserId=${anonymousId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`,
              },
            }
          );
        }

        return NextResponse.json(
          {
            id: existingUser.id,
            userType: existingUser.userType,
            dailyQuota: existingUser.dailyQuota,
            dailyUsed: existingUser.dailyUsed,
            monthlyQuota: existingUser.monthlyQuota,
            monthlyUsed: existingUser.monthlyUsed,
          },
          {
            status: 200,
            headers: {
              'Set-Cookie': `anonymousUserId=${anonymousId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`,
            },
          }
        );
      }
    }

    // 创建新的匿名用户
    const newUser = await prisma.user.create({
      data: {
        userType: UserType.ANONYMOUS,
        email: `anonymous-${Date.now()}@vietbridge.local`,
        dailyQuota: 10, // 免登录用户每天 10 次
        monthlyQuota: 100, // 免登录用户每月 100 次
        dailyUsed: 0,
        monthlyUsed: 0,
        subscription: {
          create: {
            plan: PlanType.FREE,
          },
        },
      },
      select: {
        id: true,
        userType: true,
        dailyQuota: true,
        dailyUsed: true,
        monthlyQuota: true,
        monthlyUsed: true,
      },
    });

    return NextResponse.json(newUser, {
      status: 201,
      headers: {
        'Set-Cookie': `anonymousUserId=${newUser.id}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`,
      },
    });
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    return NextResponse.json(
      { error: 'Failed to create anonymous user' },
      { status: 500 }
    );
  }
}
