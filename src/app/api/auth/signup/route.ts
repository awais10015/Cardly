import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, setSessionCookie, publicUser } from '@/lib/auth-server'
import { ensureDemoUser } from '@/lib/seed'
import { env } from '@/lib/env'
import { rateLimit, clientIp, tooMany } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limit = rateLimit(`signup:${clientIp(req.headers)}`)
  if (!limit.ok) return tooMany(limit)

  try {
    if (env.demoMode) await ensureDemoUser()
    const { name, email, password } = (await req.json()) as { name?: string; email?: string; password?: string }
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }
    const normalized = email.toLowerCase().trim()
    const existing = await db.user.findUnique({ where: { email: normalized } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }
    const user = await db.user.create({
      data: { name: name.trim(), email: normalized, passwordHash: hashPassword(password) },
    })
    await setSessionCookie(user.id)
    return NextResponse.json({ user: publicUser(user) })
  } catch (err) {
    console.error('signup error', err)
    return NextResponse.json({ error: 'Could not create the account. Please try again.' }, { status: 500 })
  }
}
