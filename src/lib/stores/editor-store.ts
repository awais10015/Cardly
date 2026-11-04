'use client'

import { create } from 'zustand'
import {
  type BusinessFields, type CardCategory, type CardDesign, type CardElement, type CardDoc,
  type InvitationFields, blankDesign, uid,
} from '@/lib/design/types'
import { instantiateTemplate, type CardTemplate } from '@/lib/design/templates'

const HISTORY_LIMIT = 60

export interface EditorSeed {
  card?: CardDoc
  template?: CardTemplate
  blank?: { size: string; withBack: boolean; title?: string; category?: CardCategory }
}

interface EditorState {
  cardId: string | null
  title: string
  category: CardCategory
  status: 'draft' | 'published'
  slug: string | null
  design: CardDesign
  business: BusinessFields | null
  invitation: InvitationFields | null
  activeSide: 'front' | 'back'
  selectedId: string | null
  editingId: string | null
  zoom: 'fit' | number
  dirty: boolean
  savedAt: string | null
  past: CardDesign[]
  future: CardDesign[]
  continuousSnapshot: CardDesign | null

  loadSeed: (seed: EditorSeed) => void
  setActiveSide: (s: 'front' | 'back') => void
  select: (id: string | null) => void
  setEditing: (id: string | null) => void
  setZoom: (z: 'fit' | number) => void
  setTitle: (t: string) => void
  setDirty: (d: boolean) => void
  markSaved: (cardId: string, slug: string | null, status: 'draft' | 'published', at: string) => void

  pushHistory: () => void
  startContinuous: () => void
  endContinuous: () => void
  undo: () => void
  redo: () => void

  currentSide: () => CardSide
  addElement: (el: CardElement) => void
  updateElement: (id: string, patch: Partial<CardElement>) => void
  removeElement: (id: string) => void
  duplicateElement: (id: string) => void
  reorderElement: (id: string, dir: 'front' | 'back' | 'forward' | 'backward') => void
  getElement: (id: string) => CardElement | undefined

  setBackground: (patch: Partial<CardSide['background']>) => void
  applyTemplate: (tpl: CardTemplate) => void
  setBusiness: (patch: Partial<BusinessFields>) => void
  setInvitation: (patch: Partial<InvitationFields>) => void
  syncRoleText: (role: string, value: string) => void
  toggleBack: (enable: boolean) => void
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

export const useEditor = create<EditorState>((set, get) => ({
  cardId: null,
  title: 'Untitled card',
  category: 'custom',
  status: 'draft',
  slug: null,
  design: blankDesign('greeting-landscape'),
  business: null,
  invitation: null,
  activeSide: 'front',
  selectedId: null,
  editingId: null,
  zoom: 'fit',
  dirty: false,
  savedAt: null,
  past: [],
  future: [],
  continuousSnapshot: null,

  loadSeed: (seed) => {
    if (seed.card) {
      set({
        cardId: seed.card.id,
        title: seed.card.title,
        category: seed.card.category,
        status: seed.card.status,
        slug: seed.card.slug ?? null,
        design: seed.card.design,
        business: seed.card.business ?? null,
        invitation: seed.card.invitation ?? null,
        activeSide: 'front',
        selectedId: null,
        editingId: null,
        zoom: 'fit',
        dirty: false,
        savedAt: seed.card.updatedAt,
        past: [],
        future: [],
        continuousSnapshot: null,
      })
    } else if (seed.template) {
      const { design, business } = instantiateTemplate(seed.template)
      set({
        cardId: null,
        title: seed.template.name,
        category: seed.template.category,
        status: 'draft',
        slug: null,
        design,
        business: business ?? null,
        invitation: seed.template.category === 'wedding' || ['engagement', 'birthday', 'corporate', 'graduation', 'anniversary', 'ramadan', 'eid'].includes(seed.template.category) ? {
          eventTitle: seed.template.name,
          hostName: 'Amara & Zahid',
          dateTime: 'Saturday, June 14th · 6:30 PM',
          venue: 'The Grand Pavilion, 12 Lakeside Ave',
          mapsUrl: 'https://maps.google.com/?q=The+Grand+Pavilion',
          rsvp: 'RSVP · +1 555 010 2030',
          dressCode: 'Dress code · Formal',
          extraInfo: 'Dinner and drinks to follow.',
        } : null,
        activeSide: 'front',
        selectedId: null,
        editingId: null,
        zoom: 'fit',
        dirty: false,
        savedAt: null,
        past: [],
        future: [],
        continuousSnapshot: null,
      })
    } else if (seed.blank) {
      set({
        cardId: null,
        title: seed.blank.title ?? 'Untitled card',
        category: seed.blank.category ?? 'custom',
        status: 'draft',
        slug: null,
        design: blankDesign(seed.blank.size, seed.blank.withBack),
        business: seed.blank.size === 'business' ? {
          fullName: 'Your Name', jobTitle: 'Job Title', company: 'Company', phone: '+1 555 000 0000',
          email: 'you@email.com', website: 'yourwebsite.com', address: '', whatsapp: '', socials: {},
        } : null,
        invitation: null,
        activeSide: 'front',
        selectedId: null,
        editingId: null,
        zoom: 'fit',
        dirty: false,
        savedAt: null,
        past: [],
        future: [],
        continuousSnapshot: null,
      })
    }
  },

  setActiveSide: (s) => set({ activeSide: s, selectedId: null, editingId: null }),
  select: (id) => set({ selectedId: id, editingId: id && get().editingId === id ? id : null }),
  setEditing: (id) => set({ editingId: id, selectedId: id }),
  setZoom: (z) => set({ zoom: z }),
  setTitle: (t) => set({ title: t, dirty: true }),
  setDirty: (d) => set({ dirty: d }),
  markSaved: (cardId, slug, status, at) => set({ cardId, slug, status, savedAt: at, dirty: false }),

  pushHistory: () => {
    const { design, past } = get()
    const next = [...past, clone(design)]
    if (next.length > HISTORY_LIMIT) next.shift()
    set({ past: next, future: [] })
  },

  startContinuous: () => set({ continuousSnapshot: clone(get().design) }),

  endContinuous: () => {
    const snap = get().continuousSnapshot
    set({ continuousSnapshot: null })
    if (!snap) return
    if (JSON.stringify(snap) === JSON.stringify(get().design)) return
    const past = [...get().past, snap]
    if (past.length > HISTORY_LIMIT) past.shift()
    set({ past, future: [] })
  },

  undo: () => {
    const { past, future, design } = get()
    if (!past.length) return
    const prev = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      future: [clone(design), ...future].slice(0, HISTORY_LIMIT),
      design: prev,
      selectedId: null,
      editingId: null,
      dirty: true,
    })
  },

  redo: () => {
    const { past, future, design } = get()
    if (!future.length) return
    const next = future[0]
    set({
      future: future.slice(1),
      past: [...past, clone(design)].slice(-HISTORY_LIMIT),
      design: next,
      selectedId: null,
      editingId: null,
      dirty: true,
    })
  },

  currentSide: () => {
    const { design, activeSide } = get()
    return activeSide === 'back' && design.back ? design.back : design.front
  },

  addElement: (el) => {
    get().pushHistory()
    const { design, activeSide } = get()
    const sideKey = activeSide === 'back' && design.back ? 'back' : 'front'
    const next = clone(design)
    next[sideKey].elements = [...next[sideKey].elements, el]
    set({ design: next, selectedId: el.id, editingId: el.type === 'text' ? null : null, dirty: true })
  },

  updateElement: (id, patch) => {
    const { design, activeSide } = get()
    const sideKey = activeSide === 'back' && design.back ? 'back' : 'front'
    const next = clone(design)
    next[sideKey].elements = next[sideKey].elements.map((el) => (el.id === id ? ({ ...el, ...patch } as CardElement) : el))
    set({ design: next, dirty: true })
  },

  removeElement: (id) => {
    get().pushHistory()
    const { design, activeSide } = get()
    const sideKey = activeSide === 'back' && design.back ? 'back' : 'front'
    const next = clone(design)
    next[sideKey].elements = next[sideKey].elements.filter((el) => el.id !== id)
    set({ design: next, selectedId: null, editingId: null, dirty: true })
  },

  duplicateElement: (id) => {
    get().pushHistory()
    const { design, activeSide } = get()
    const sideKey = activeSide === 'back' && design.back ? 'back' : 'front'
    const next = clone(design)
    const el = next[sideKey].elements.find((e) => e.id === id)
    if (!el) return
    const copy = { ...el, id: uid(el.type[0]), x: el.x + 24, y: el.y + 24 } as CardElement
    const idx = next[sideKey].elements.findIndex((e) => e.id === id)
    next[sideKey].elements.splice(idx + 1, 0, copy)
    set({ design: next, selectedId: copy.id, dirty: true })
  },

  reorderElement: (id, dir) => {
    get().pushHistory()
    const { design, activeSide } = get()
    const sideKey = activeSide === 'back' && design.back ? 'back' : 'front'
    const next = clone(design)
    const els = next[sideKey].elements
    const idx = els.findIndex((e) => e.id === id)
    if (idx < 0) return
    const [el] = els.splice(idx, 1)
    switch (dir) {
      case 'front':
        els.push(el)
        break
      case 'back':
        els.unshift(el)
        break
      case 'forward':
        els.splice(Math.min(idx + 1, els.length), 0, el)
        break
      case 'backward':
        els.splice(Math.max(idx - 1, 0), 0, el)
        break
    }
    set({ design: next, dirty: true })
  },

  getElement: (id) => {
    const side = get().currentSide()
    return side.elements.find((e) => e.id === id)
  },

  setBackground: (patch) => {
    get().pushHistory()
    const { design, activeSide } = get()
    const sideKey = activeSide === 'back' && design.back ? 'back' : 'front'
    const next = clone(design)
    next[sideKey].background = { ...next[sideKey].background, ...patch }
    set({ design: next, dirty: true })
  },

  applyTemplate: (tpl) => {
    get().pushHistory()
    const { design, business } = instantiateTemplate(tpl)
    set({
      design,
      business: business ?? null,
      category: tpl.category,
      title: get().cardId ? get().title : tpl.name,
      selectedId: null,
      editingId: null,
      dirty: true,
    })
  },

  setBusiness: (patch) => {
    const business = { ...(get().business ?? {}), ...patch } as BusinessFields
    set({ business, dirty: true })
    // sync bound text elements
    const { design } = get()
    const next = clone(design)
    for (const key of Object.keys(patch) as (keyof BusinessFields)[]) {
      const role = key
      const value = patch[key]
      if (typeof value !== 'string') continue
      for (const sk of ['front', 'back'] as const) {
        const s = next[sk]
        if (!s) continue
        s.elements = s.elements.map((el) => (el.role === role && el.type === 'text' ? { ...el, text: value } : el))
      }
    }
    set({ design: next })
  },

  setInvitation: (patch) => {
    const invitation = { ...(get().invitation ?? {}), ...patch } as InvitationFields
    set({ invitation, dirty: true })
    const { design } = get()
    const next = clone(design)
    for (const key of Object.keys(patch) as (keyof InvitationFields)[]) {
      const value = patch[key]
      if (typeof value !== 'string') continue
      for (const sk of ['front', 'back'] as const) {
        const s = next[sk]
        if (!s) continue
        s.elements = s.elements.map((el) => (el.role === key && el.type === 'text' ? { ...el, text: value } : el))
      }
    }
    set({ design: next })
  },

  syncRoleText: (role, value) => {
    const { business, invitation } = get()
    if (business && role in business) {
      set({ business: { ...business, [role]: value } })
    } else if (invitation && role in invitation) {
      set({ invitation: { ...invitation, [role]: value } })
    }
  },

  toggleBack: (enable) => {
    get().pushHistory()
    const { design } = get()
    const next = clone(design)
    if (enable) {
      next.back = clone(design.front)
      next.back.elements = []
    } else {
      next.back = undefined
    }
    set({ design: next, activeSide: enable ? get().activeSide : 'front', selectedId: null, dirty: true })
  },
}))

export function selectedElement(state: EditorState): CardElement | null {
  if (!state.selectedId) return null
  const side = state.activeSide === 'back' && state.design.back ? state.design.back : state.design.front
  return side.elements.find((e) => e.id === state.selectedId) ?? null
}
