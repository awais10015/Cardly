import { NextResponse } from 'next/server'
import { setSessionCookie, publicUser } from '@/lib/auth-server'
import { ensureDemoUser } from '@/lib/seed'
import { env } from '@/lib/env'

export async function POST() {
  if (!env.demoMode) {
    return NextResponse.json(
      { error: 'The demo account is disabled on this deployment.' },
      { status: 403 },
    )
  }
  try {
    const user = await ensureDemoUser()
    await setSessionCookie(user.id)
    return NextResponse.json({ user: publicUser(user) })
  } catch (err) {
    console.error('demo login error', err)
    return NextResponse.json({ error: 'Could not start the demo. Please try again.' }, { status: 500 })
  }
}
