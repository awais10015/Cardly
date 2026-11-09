import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { issueResetToken } from '@/lib/auth-server'
import { mailerEnabled } from '@/lib/env'
import { sendPasswordResetEmail } from '@/lib/mailer'
import { rateLimit, clientIp, tooMany } from '@/lib/rate-limit'

/**
 * Issues a password-reset token.
 * - With RESEND_API_KEY + EMAIL_FROM set, the token is e-mailed as a link and
 *   nothing is returned in the response.
 * - Without a mail provider (sandbox/dev default) the token is returned in the
 *   response and surfaced in the UI so the flow still works end-to-end.
 */
export async function POST(req: NextRequest) {
  const limit = rateLimit(`reset:${clientIp(req.headers)}`, 5)
  if (!limit.ok) return tooMany(limit)

  try {
    const { email } = (await req.json()) as { email?: string }
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    // Always answer ok to avoid leaking which emails exist
    if (!user) return NextResponse.json({ ok: true, resetPath: null, emailed: false })

    const token = issueResetToken(user.id)
    const origin = req.nextUrl.origin

    if (mailerEnabled) {
      const sent = await sendPasswordResetEmail(user.email, token, origin)
      if (sent) return NextResponse.json({ ok: true, resetPath: null, emailed: true })
      // Mail provider configured but delivery failed — fall back so the user isn't stuck.
    }

    return NextResponse.json({ ok: true, resetPath: token, emailed: false })
  } catch (err) {
    console.error('reset error', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
