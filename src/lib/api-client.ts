'use client'

import type { BusinessFields, CardCategory, CardDoc, InvitationFields } from '@/lib/design/types'
import type { SessionUser } from '@/lib/stores/app-store'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    const err = new Error(data.error ?? `Request failed (${res.status})`)
    throw err
  }
  return data
}

/* -------------------------------- auth ------------------------------- */

export const authApi = {
  me: () => request<{ user: SessionUser | null }>('/api/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: SessionUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  demo: () => request<{ user: SessionUser }>('/api/auth/demo', { method: 'POST' }),
  signup: (name: string, email: string, password: string) =>
    request<{ user: SessionUser }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  reset: (email: string) => request<{ ok: true; resetPath: string }>('/api/auth/reset', { method: 'POST', body: JSON.stringify({ email }) }),
  resetConfirm: (token: string, password: string) =>
    request<{ ok: true }>('/api/auth/reset-confirm', { method: 'POST', body: JSON.stringify({ token, password }) }),
  updateProfile: (name: string, email: string) =>
    request<{ user: SessionUser }>('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ name, email }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('/api/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
}

/* -------------------------------- cards ------------------------------ */

export interface CardInput {
  title: string
  category: CardCategory
  design: unknown
  status?: 'draft' | 'published'
  business?: BusinessFields | null
  invitation?: InvitationFields | null
}

export const cardsApi = {
  list: (search?: string) =>
    request<{ cards: CardDoc[] }>(`/api/cards${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: string) => request<{ card: CardDoc }>(`/api/cards/${id}`),
  create: (input: CardInput) => request<{ card: CardDoc }>('/api/cards', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<CardInput> & { status?: 'draft' | 'published'; publish?: boolean; unpublish?: boolean }) =>
    request<{ card: CardDoc }>(`/api/cards/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: string) => request<{ ok: true }>(`/api/cards/${id}`, { method: 'DELETE' }),
  duplicate: (id: string) => request<{ card: CardDoc }>(`/api/cards/${id}/duplicate`, { method: 'POST' }),
}

export const publicApi = {
  getCard: (slug: string) => request<{ card: CardDoc }>(`/api/public/${slug}`),
}

export function publicCardUrl(slug: string): string {
  if (typeof window === 'undefined') return `/card/${slug}`
  return `${window.location.origin}/#/card/${slug}`
}
