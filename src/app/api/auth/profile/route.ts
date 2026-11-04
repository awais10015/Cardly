import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, publicUser } from '@/lib/auth-server'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    const { name, email } = (await req.json()) as { name?: string; email?: string }
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }
    const normalized = email.toLowerCase().trim()
    const clash = await db.user.findFirst({ where: { email: normalized, NOT: { id: session.id } } })
    if (clash) return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 })
    const user = await db.user.update({
      where: { id: session.id },
      data: { name: name.trim(), email: normalized },
    })
    return NextResponse.json({ user: publicUser(user) })
  } catch (err) {
    console.error('profile update error', err)
    return NextResponse.json({ error: 'Could not update the profile.' }, { status: 500 })
  }
}
