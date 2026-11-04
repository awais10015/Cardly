import { NextResponse } from 'next/server'
import { getSessionUser, publicUser } from '@/lib/auth-server'

export async function GET() {
  try {
    const user = await getSessionUser()
    return NextResponse.json({ user: user ? publicUser(user) : null })
  } catch {
    return NextResponse.json({ user: null })
  }
}
