import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSessionCookie, publicUser } from '@/lib/auth-server'
import { ensureDemoUser } from '@/lib/seed'
import { env } from '@/lib/env'
import { rateLimit, clientIp, tooMany } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limit = rateLimit(`login:${clientIp(req.headers)}`)
  if (!limit.ok) return tooMany(limit)

  try {
    const { email, password } = (await req.json()) as { email?: string; password?: string }
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (env.demoMode) await ensureDemoUser() // keeps the shared sandbox database alive
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 })
    }
    await setSessionCookie(user.id)
    return NextResponse.json({ user: publicUser(user) })
  } catch (err) {
    console.error('login error', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
