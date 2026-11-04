import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, consumeResetToken } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = (await req.json()) as { token?: string; password?: string }
    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'A valid token and a 6+ character password are required.' }, { status: 400 })
    }
    const userId = consumeResetToken(token)
    if (!userId) return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 })
    await db.user.update({ where: { id: userId }, data: { passwordHash: hashPassword(password) } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('reset-confirm error', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
