import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { issueResetToken } from '@/lib/auth-server'

/**
 * Issues a password-reset token. This sandbox has no mail provider, so the
 * token is returned in the response and surfaced in the UI for the demo.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string }
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    // Always answer ok to avoid leaking which emails exist
    if (!user) return NextResponse.json({ ok: true, resetPath: null })
    const token = issueResetToken(user.id)
    return NextResponse.json({ ok: true, resetPath: token })
  } catch (err) {
    console.error('reset error', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
