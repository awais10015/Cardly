import { NextResponse } from 'next/server'
import { setSessionCookie, publicUser } from '@/lib/auth-server'
import { ensureDemoUser } from '@/lib/seed'

export async function POST() {
  try {
    const user = await ensureDemoUser()
    await setSessionCookie(user.id)
    return NextResponse.json({ user: publicUser(user) })
  } catch (err) {
    console.error('demo login error', err)
    return NextResponse.json({ error: 'Could not start the demo. Please try again.' }, { status: 500 })
  }
}
