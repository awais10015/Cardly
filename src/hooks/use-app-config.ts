'use client'

import * as React from 'react'

export interface AppConfig {
  appName: string
  demoMode: boolean
  mailerEnabled: boolean
}

let cache: AppConfig | null = null

/**
 * Fetches the deployment's public configuration from /api/config once per
 * session (e.g. to hide the demo button when DEMO_MODE=off).
 */
export function useAppConfig(): AppConfig | null {
  const [config, setConfig] = React.useState<AppConfig | null>(cache)

  React.useEffect(() => {
    if (cache) return
    let alive = true
    fetch('/api/config')
      .then((r) => r.json())
      .then((c: AppConfig) => {
        cache = c
        if (alive) setConfig(c)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return config
}
