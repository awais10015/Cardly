import 'server-only'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Central environment configuration — the ONLY place that reads process.env.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every value has a working local default so the app runs with zero setup.
 *  For production, copy `.env.example` → `.env`, fill in real values and go.
 *  Invalid values fail fast at boot with a clear message.
 */

function str(key: string, fallback: string): string {
  const v = process.env[key]
  return v === undefined || v.trim() === '' ? fallback : v.trim()
}

function bool(key: string, fallback: boolean): boolean {
  const v = process.env[key]?.trim().toLowerCase()
  if (v === undefined || v === '') return fallback
  return ['1', 'true', 'yes', 'on', 'enabled'].includes(v)
}

function int(key: string, fallback: number): number {
  const v = Number(process.env[key])
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback
}

function warn(key: string, message: string) {
  console.warn(`⚠️  [env] ${key}: ${message}`)
}

/* ------------------------------- database -------------------------------- */

export type DbProvider = 'sqlite' | 'postgresql' | 'mysql'

const provider = str('DB_PROVIDER', 'sqlite').toLowerCase()
const PROVIDERS: DbProvider[] = ['sqlite', 'postgresql', 'mysql']

export const env = {
  nodeEnv: str('NODE_ENV', 'development'),
  isProd: process.env.NODE_ENV === 'production',

  /** Prisma provider — must match DATABASE_URL. sqlite keeps local dev zero-config. */
  dbProvider: (PROVIDERS.includes(provider as DbProvider) ? provider : 'sqlite') as DbProvider,
  databaseUrl: str('DATABASE_URL', 'file:./db/custom.db'),

  /** Secret used to sign session cookies. REQUIRED in production. */
  authSecret: str('AUTH_SECRET', ''),

  /** Session lifetime in days. */
  sessionDays: int('SESSION_TTL_DAYS', 30),

  /**
   * Canonical public origin of this deployment (no trailing slash).
   * Used for share links, QR codes and password-reset e-mails.
   * Falls back to the incoming request origin when unset.
   */
  appUrl: str('APP_URL', '').replace(/\/+$/, ''),

  /** Public app name (used in e-mails). */
  appName: str('APP_NAME', 'Cardly'),

  /** Instant demo account. Turn OFF for real deployments. */
  demoMode: bool('DEMO_MODE', true),
  demoEmail: str('DEMO_EMAIL', 'demo@cardly.app'),
  demoPassword: str('DEMO_PASSWORD', 'demo1234'),

  /** Transactional e-mail (Resend). When unset, reset tokens are surfaced in the UI. */
  resendApiKey: str('RESEND_API_KEY', ''),
  emailFrom: str('EMAIL_FROM', 'Cardly <onboarding@resend.dev>'),

  /** Simple in-memory rate limiting for auth endpoints. */
  rateLimitMax: int('RATE_LIMIT_MAX', 20),
  rateLimitWindowMs: int('RATE_LIMIT_WINDOW_MS', 60_000),
} as const

/* ------------------------------ validation ------------------------------- */

if (!env.authSecret) {
  if (env.isProd) {
    throw new Error(
      '[env] AUTH_SECRET is required in production. Generate one with: openssl rand -hex 32',
    )
  }
  warn('AUTH_SECRET', 'not set — using an insecure development fallback. Set it before deploying.')
}
export const AUTH_SECRET = env.authSecret || 'cardly-dev-secret-7f3a9c2e'

if (env.isProd && env.authSecret && env.authSecret.length < 32) {
  warn('AUTH_SECRET', 'is shorter than 32 chars — use `openssl rand -hex 32`.')
}

if (env.isProd && !env.appUrl) {
  warn('APP_URL', 'not set — share links will fall back to the request origin.')
}

if (env.dbProvider !== 'sqlite' && env.databaseUrl.startsWith('file:')) {
  throw new Error(
    `[env] DB_PROVIDER=${env.dbProvider} but DATABASE_URL looks like a SQLite path (${env.databaseUrl}). ` +
      'Use a matching connection string, e.g. postgresql://user:pass@host:5432/dbname',
  )
}
if (env.dbProvider === 'sqlite' && !env.databaseUrl.startsWith('file:')) {
  throw new Error(
    `[env] DATABASE_URL=${env.databaseUrl} does not match DB_PROVIDER=sqlite. ` +
      'Either use file:./db/custom.db or set DB_PROVIDER=postgresql|mysql.',
  )
}

/** Whether a real transactional mail provider is configured. */
export const mailerEnabled = Boolean(env.resendApiKey)

/** Human-readable summary for the /api/health endpoint (no secrets). */
export function envSummary() {
  return {
    nodeEnv: env.nodeEnv,
    dbProvider: env.dbProvider,
    authSecretSet: Boolean(env.authSecret),
    appUrl: env.appUrl || '(request origin)',
    demoMode: env.demoMode,
    mailer: mailerEnabled ? 'resend' : 'ui-fallback',
    rateLimit: `${env.rateLimitMax}/${Math.round(env.rateLimitWindowMs / 1000)}s`,
  }
}
