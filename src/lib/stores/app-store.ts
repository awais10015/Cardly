'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewName =
  | 'home'
  | 'templates'
  | 'template'
  | 'create'
  | 'editor'
  | 'dashboard'
  | 'auth'
  | 'card'
  | 'profile'
  | 'pricing'

export interface Route {
  name: ViewName
  id?: string
}

export interface SessionUser {
  id: string
  email: string
  name: string
}

interface AppState {
  route: Route
  user: SessionUser | null
  authChecked: boolean
  favorites: string[]
  authOpen: boolean
  authReason: string | null

  navigate: (name: ViewName, id?: string) => void
  setRouteFromHash: () => void
  setUser: (u: SessionUser | null) => void
  setAuthChecked: (v: boolean) => void
  toggleFavorite: (templateId: string) => void
  isFavorite: (templateId: string) => boolean
  openAuth: (reason?: string) => void
  closeAuth: () => void
}

function routeToHash(route: Route): string {
  const base = `#/${route.name}`
  return route.id ? `${base}/${route.id}` : base
}

function hashToRoute(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '')
  if (!clean) return { name: 'home' }
  const [name, id] = clean.split('/')
  const valid: ViewName[] = ['home', 'templates', 'template', 'create', 'editor', 'dashboard', 'auth', 'card', 'profile', 'pricing']
  if (!valid.includes(name as ViewName)) return { name: 'home' }
  return { name: name as ViewName, id: id || undefined }
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      route: { name: 'home' },
      user: null,
      authChecked: false,
      favorites: [],
      authOpen: false,
      authReason: null,

      navigate: (name, id) => {
        const route = { name, id }
        set({ route, authOpen: false })
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', routeToHash(route))
          window.scrollTo({ top: 0 })
        }
      },

      setRouteFromHash: () => {
        if (typeof window === 'undefined') return
        const route = hashToRoute(window.location.hash)
        set({ route, authOpen: false })
      },

      setUser: (user) => set({ user }),

      setAuthChecked: (v) => set({ authChecked: v }),

      toggleFavorite: (templateId) => {
        const favorites = get().favorites
        set({
          favorites: favorites.includes(templateId)
            ? favorites.filter((f) => f !== templateId)
            : [...favorites, templateId],
        })
      },

      isFavorite: (templateId) => get().favorites.includes(templateId),

      openAuth: (reason) => set({ authOpen: true, authReason: reason ?? null }),
      closeAuth: () => set({ authOpen: false, authReason: null }),
    }),
    {
      name: 'cardly-app',
      partialize: (s) => ({ favorites: s.favorites }),
    },
  ),
)
