import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { envSummary } from '@/lib/env'

/**
 * Deployment health check — verifies the database connection and reports the
 * active configuration (no secrets). Wire your uptime monitor to this route.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, service: 'cardly', database: 'up', config: envSummary() })
  } catch (err) {
    console.error('health check failed', err)
    return NextResponse.json(
      { ok: false, service: 'cardly', database: 'down', config: envSummary() },
      { status: 503 },
    )
  }
}
