import { NextResponse } from 'next/server'
import { env, mailerEnabled } from '@/lib/env'

/**
 * Public client configuration. Lets the UI adapt to deployment settings
 * (e.g. hide the demo button when DEMO_MODE=off) without baking secrets
 * into the client bundle.
 */
export function GET() {
  return NextResponse.json({
    appName: env.appName,
    demoMode: env.demoMode,
    mailerEnabled,
  })
}
