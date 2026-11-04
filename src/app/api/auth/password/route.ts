import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, hashPassword, verifyPassword } from '@/lib/auth-server'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    const { currentPassword, newPassword } = (await req.json()) as { currentPassword?: string; newPassword?: string }
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Current password and a new 6+ character password are required.' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { id: session.id } })
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 400 })
    }
    await db.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(newPassword) } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('password change error', err)
    return NextResponse.json({ error: 'Could not change the password.' }, { status: 500 })
  }
}
