import 'server-only'
import { env } from '@/lib/env'

/**
 * Minimal in-memory sliding-window rate limiter for auth endpoints.
 * Good enough for a single deployment; swap for Upstash/Redis if you
 * scale horizontally (the call sites stay identical).
 */

type Bucket = { hits: number[] }

const buckets = new Map<string, Bucket>()

// Periodically purge stale buckets so the map never grows unbounded.
let lastSweep = Date.now()
function sweep(windowMs: number) {
  const now = Date.now()
  if (now - lastSweep < windowMs) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs)
    if (bucket.hits.length === 0) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  retryAfterSec: number
  remaining: number
}

/**
 * Records a hit for `key` and reports whether it is allowed.
 * @param key    e.g. `login:1.2.3.4`
 * @param max    max hits per window (default from RATE_LIMIT_MAX)
 * @param windowMs window length in ms (default from RATE_LIMIT_WINDOW_MS)
 */
export function rateLimit(key: string, max = env.rateLimitMax, windowMs = env.rateLimitWindowMs): RateLimitResult {
  sweep(windowMs)
  const now = Date.now()
  const bucket = buckets.get(key) ?? { hits: [] }
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs)
  bucket.hits.push(now)
  buckets.set(key, bucket)

  if (bucket.hits.length > max) {
    const oldest = bucket.hits[0]
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      remaining: 0,
    }
  }
  return { ok: true, retryAfterSec: 0, remaining: max - bucket.hits.length }
}

/** Best-effort client IP from proxy headers (Vercel/Cloudflare/nginx). */
export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

export function tooMany(res: { retryAfterSec: number }) {
  return Response.json(
    { error: `Too many attempts — try again in ${res.retryAfterSec}s.` },
    { status: 429, headers: { 'Retry-After': String(res.retryAfterSec) } },
  )
}
