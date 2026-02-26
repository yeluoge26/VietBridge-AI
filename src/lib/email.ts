// ============================================================================
// VietBridge AI V2 — Email Utility
// Sends verification and password reset emails via SMTP (Nodemailer-free)
// Uses a simple fetch-based approach with Resend API or fallback console log
// ============================================================================

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "VietBridge AI <noreply@vietbridge.ai>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Send an email. Uses Resend API if configured, otherwise logs to console.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Email send failed:", err);
      throw new Error("邮件发送失败");
    }
  } else {
    // Development fallback — log to console
    console.log("========== EMAIL (dev mode) ==========");
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Body: ${payload.html}`);
    console.log("=======================================");
  }
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "验证您的 VietBridge AI 邮箱",
    html: `
      <div style="max-width:420px;margin:0 auto;padding:32px;font-family:system-ui,sans-serif;">
        <h2 style="color:#111;margin-bottom:16px;">邮箱验证</h2>
        <p style="color:#555;font-size:14px;line-height:1.6;">
          您好！请点击下方按钮验证您的邮箱地址：
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 32px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          验证邮箱
        </a>
        <p style="color:#999;font-size:12px;">
          如果您没有注册 VietBridge AI，请忽略此邮件。<br/>
          链接有效期 24 小时。
        </p>
      </div>
    `,
  });
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "重置您的 VietBridge AI 密码",
    html: `
      <div style="max-width:420px;margin:0 auto;padding:32px;font-family:system-ui,sans-serif;">
        <h2 style="color:#111;margin-bottom:16px;">重置密码</h2>
        <p style="color:#555;font-size:14px;line-height:1.6;">
          您请求了密码重置。请点击下方按钮设置新密码：
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 32px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          重置密码
        </a>
        <p style="color:#999;font-size:12px;">
          如果您没有请求重置密码，请忽略此邮件。<br/>
          链接有效期 1 小时。
        </p>
      </div>
    `,
  });
}
