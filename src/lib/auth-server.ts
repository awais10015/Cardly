import 'server-only'
import crypto from 'node:crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

const COOKIE_NAME = 'cardly_session'
const SESSION_DAYS = 30
const SECRET = process.env.AUTH_SECRET ?? 'cardly-dev-secret-7f3a9c2e'

/* ----------------------------- passwords ----------------------------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = crypto.scryptSync(password, salt, 32)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
}

/* ------------------------------ sessions ----------------------------- */

function sign(value: string): string {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex')
}

function makeToken(userId: string): string {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = `${userId}.${exp}`
  return `${payload}.${sign(payload)}`
}

function readToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [userId, exp, sig] = parts
  if (sign(`${userId}.${exp}`) !== sig) return null
  if (Number(exp) < Date.now()) return null
  return userId
}

export async function setSessionCookie(userId: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, makeToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' })
}

export async function getSessionUser() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const userId = readToken(token)
  if (!userId) return null
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })
  return user
}

/* -------------------------- password resets -------------------------- */

const resetTokens = new Map<string, { userId: string; exp: number }>()

export function issueResetToken(userId: string): string {
  const token = crypto.randomBytes(24).toString('hex')
  resetTokens.set(token, { userId, exp: Date.now() + 30 * 60 * 1000 })
  return token
}

export function consumeResetToken(token: string): string | null {
  const entry = resetTokens.get(token)
  if (!entry || entry.exp < Date.now()) return null
  resetTokens.delete(token)
  return entry.userId
}

export function publicUser(u: { id: string; email: string; name: string }) {
  return { id: u.id, email: u.email, name: u.name }
}
