import 'server-only'
import { env, mailerEnabled } from '@/lib/env'

/**
 * Optional transactional e-mail via Resend (https://resend.com).
 * Uses plain fetch — no extra dependency. When RESEND_API_KEY is not set the
 * app falls back to surfacing password-reset tokens in the UI (sandbox mode).
 */

export async function sendPasswordResetEmail(to: string, token: string, requestOrigin: string): Promise<boolean> {
  if (!mailerEnabled) return false

  const base = env.appUrl || requestOrigin
  const resetUrl = `${base}/#/auth?reset=${token}`
  const from = env.emailFrom

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Reset your ${env.appName} password`,
        html: resetEmailHtml(resetUrl, token),
        text: `Reset your ${env.appName} password:\n\n${resetUrl}\n\nOr paste this code in the app: ${token}\n\nThe link expires in 30 minutes.`,
      }),
    })
    if (!res.ok) {
      console.error('[mailer] resend error', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[mailer] request failed', err)
    return false
  }
}

function resetEmailHtml(resetUrl: string, token: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f5fa;font-family:Segoe UI,Arial,sans-serif;color:#1e1b2e;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e4f0;">
    <div style="background:linear-gradient(135deg,#7c3aed,#c026d3);padding:28px 32px;color:#fff;">
      <h1 style="margin:0;font-size:20px;">Reset your password</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#ede9fe;">${esc(env.appName)} · password reset request</p>
    </div>
    <div style="padding:28px 32px;">
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
        We received a request to reset your password. Click the button below — the link is valid for
        <strong>30 minutes</strong>.
      </p>
      <a href="${esc(resetUrl)}"
         style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px;">
        Choose a new password
      </a>
      <p style="margin:20px 0 8px;font-size:12px;color:#6b6480;">Or paste this code into the app:</p>
      <code style="display:block;background:#f3f1fa;border:1px solid #e7e4f0;border-radius:8px;padding:10px 12px;font-size:13px;word-break:break-all;">${esc(token)}</code>
      <p style="margin:20px 0 0;font-size:12px;color:#6b6480;">If you didn't request this, you can safely ignore this e-mail.</p>
    </div>
  </div>
</body></html>`
}
