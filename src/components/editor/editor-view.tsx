'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft, Loader2, Maximize, PanelLeftClose, PanelRightClose,
  Pencil, Redo2, Save, Share2, Undo2, ZoomIn, ZoomOut, Check,
} from 'lucide-react'
import { useEditor } from '@/lib/stores/editor-store'
import { useApp } from '@/lib/stores/app-store'
import { cardsApi } from '@/lib/api-client'
import { EditorCanvas } from './canvas'
import { LeftPanel } from './left-panel'
import { RightPanel } from './right-panel'
import { ShareDialog } from './share-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type LeftTabId = Parameters<typeof LeftPanel>[0]['tab']

export function EditorView({ cardId }: { cardId: string | null }) {
  const seedKey = cardId ?? 'default'
  const [ready, setReady] = React.useState(false)
  const [leftOpen, setLeftOpen] = React.useState(true)
  const [rightOpen, setRightOpen] = React.useState(true)
  const [mobilePanel, setMobilePanel] = React.useState<'left' | 'right' | null>(null)
  const [leftTab, setLeftTab] = React.useState<LeftTabId>('templates')
  const [shareOpen, setShareOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const { navigate, user, openAuth } = useApp()

  const design = useEditor((s) => s.design)
  const zoom = useEditor((s) => s.zoom)
  const setZoom = useEditor((s) => s.setZoom)
  const dirty = useEditor((s) => s.dirty)
  const title = useEditor((s) => s.title)
  const setTitle = useEditor((s) => s.setTitle)
  const status = useEditor((s) => s.status)
  const activeSide = useEditor((s) => s.activeSide)
  const setActiveSide = useEditor((s) => s.setActiveSide)

  /* ------------------------------ seed load ------------------------------ */
  React.useEffect(() => {
    let alive = true
    setReady(false)
    const load = async () => {
      const { loadSeed, cardId: currentId } = useEditor.getState()
      try {
        if (!cardId) {
          // blank editor unless a seed is pending in sessionStorage
          const pending = sessionStorage.getItem('cardly-editor-seed')
          if (pending) {
            sessionStorage.removeItem('cardly-editor-seed')
            loadSeed(JSON.parse(pending))
          } else if (!currentId) {
            loadSeed({ blank: { size: 'greeting-landscape', withBack: false, category: 'custom' } })
          }
        } else if (cardId.startsWith('tpl:')) {
          const { getTemplate } = await import('@/lib/design/templates')
          const tpl = getTemplate(cardId.slice(4))
          if (tpl) loadSeed({ template: tpl })
          else {
            toast.error('Template not found')
            navigate('templates')
            return
          }
        } else if (cardId.startsWith('new:')) {
          const [, size, back, category] = cardId.split(':')
          loadSeed({
            blank: {
              size,
              withBack: back === 'back',
              category: (category as never) ?? 'custom',
              title: category === 'business' ? 'My business card' : 'Untitled card',
            },
          })
        } else {
          const { card } = await cardsApi.get(cardId)
          if (!alive) return
          loadSeed({ card })
        }
      } catch (err) {
        toast.error((err as Error).message || 'Could not open this card')
        navigate('dashboard')
        return
      }
      if (alive) setReady(true)
    }
    void load()
    return () => {
      alive = false
    }
  }, [seedKey])

  /* -------------------------------- save --------------------------------- */
  const save = React.useCallback(
    async (silent = false) => {
      if (!user) {
        openAuth('Create a free account (or use the demo) to save this card.')
        return
      }
      setSaving(true)
      try {
        const store = useEditor.getState()
        const payload = {
          title: store.title,
          category: store.category,
          design: store.design,
          business: store.business,
          invitation: store.invitation,
        }
        if (store.cardId) {
          const { card } = await cardsApi.update(store.cardId, payload)
          useEditor.getState().markSaved(card.id, card.slug ?? null, card.status, card.updatedAt)
        } else {
          const { card } = await cardsApi.create(payload)
          useEditor.getState().markSaved(card.id, card.slug ?? null, card.status, card.updatedAt)
          // keep deep-link in sync
          window.history.replaceState(null, '', `#/editor/${card.id}`)
        }
        if (!silent) toast.success('Card saved to your dashboard')
      } catch (err) {
        toast.error((err as Error).message)
      } finally {
        setSaving(false)
      }
    },
    [user, openAuth],
  )

  /* --------------------------- keyboard shortcuts ------------------------ */
  React.useEffect(() => {
    let nudgeTimer: ReturnType<typeof setTimeout> | null = null
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useEditor.getState()
      const inField =
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save()
        return
      }
      if (inField) return

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        store.redo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && store.selectedId) {
        e.preventDefault()
        store.duplicateElement(store.selectedId)
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedId) {
        e.preventDefault()
        store.removeElement(store.selectedId)
        return
      }
      if (e.key === 'Escape') {
        store.select(null)
        store.setEditing(null)
        return
      }
      if (store.selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const el = store.getElement(store.selectedId)
        if (!el || el.locked) return
        if (!nudgeTimer) store.startContinuous()
        const step = e.shiftKey ? 10 : 1
        const patch =
          e.key === 'ArrowUp' ? { y: el.y - step } :
          e.key === 'ArrowDown' ? { y: el.y + step } :
          e.key === 'ArrowLeft' ? { x: el.x - step } :
          { x: el.x + step }
        store.updateElement(el.id, patch)
        if (nudgeTimer) clearTimeout(nudgeTimer)
        nudgeTimer = setTimeout(() => {
          useEditor.getState().endContinuous()
          nudgeTimer = null
        }, 600)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [save])

  /* warn before leaving with unsaved edits */
  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useEditor.getState().dirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const zoomPct = zoom === 'fit' ? null : Math.round(zoom * 100)

  return (
    // h-svh (small viewport height) keeps the bottom bar reachable on mobile
    // browsers where 100vh ignores the address bar; h-screen is the fallback.
    <div className="flex h-screen h-svh flex-col overflow-hidden bg-secondary/40">
      {/* ------------------------------ toolbar ------------------------------ */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background px-2 sm:px-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(user ? 'dashboard' : 'home')} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 w-20 min-w-0 border-transparent bg-transparent text-sm font-semibold shadow-none hover:border-border sm:w-56"
            aria-label="Card title"
          />
          {status === 'published' && (
            <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 sm:flex dark:text-emerald-400">
              <Check className="h-3 w-3" /> Published
            </span>
          )}
          {dirty && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Unsaved changes" />}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex" onClick={() => useEditor.getState().undo()} title="Undo (⌘Z)" aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:flex" onClick={() => useEditor.getState().redo()} title="Redo (⌘⇧Z)" aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

          <div className="hidden items-center rounded-lg border border-border/70 bg-secondary/50 p-0.5 sm:flex">
            <button
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setZoom(Math.max(0.1, (zoomPct ?? Math.round(100 * 0.5)) / 100 - 0.1))}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              className="min-w-14 rounded-md px-1 text-center text-xs font-medium tabular-nums text-muted-foreground hover:text-foreground"
              onClick={() => setZoom(zoomPct ? 1 : 'fit')}
              title="Toggle 100% / fit"
            >
              {zoomPct ? `${zoomPct}%` : 'Fit'}
            </button>
            <button
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setZoom(Math.min(3, (zoomPct ?? 50) / 100 + 0.1))}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setZoom('fit')}
              aria-label="Fit to screen"
            >
              <Maximize className="h-3.5 w-3.5" />
            </button>
          </div>

          {design.back && (
            <>
              <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
              <div className="flex rounded-lg border border-border/70 bg-secondary/50 p-0.5">
                {(['front', 'back'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSide(s)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                      activeSide === s ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 lg:hidden xl:flex"
            onClick={() => setRightOpen((v) => !v)}
            aria-label="Toggle settings panel"
          >
            <PanelRightClose className={cn('h-4 w-4 transition-transform', !rightOpen && 'rotate-180')} />
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button size="sm" className="h-8 rounded-full shadow-md shadow-violet-600/20" onClick={() => setShareOpen(true)}>
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </header>

      {/* ------------------------------ body ------------------------------ */}
      <div className="relative flex min-h-0 flex-1">
        {/* desktop left panel */}
        {leftOpen && (
          <div className="hidden w-[336px] shrink-0 lg:block">
            <LeftPanel tab={leftTab} setTab={setLeftTab} />
          </div>
        )}
        {!leftOpen && (
          <button
            onClick={() => setLeftOpen(true)}
            className="hidden shrink-0 items-center border-r border-border/60 bg-card px-1.5 text-muted-foreground hover:text-foreground lg:flex"
            aria-label="Show left panel"
          >
            <PanelLeftClose className="h-4 w-4 rotate-180" />
          </button>
        )}

        {/* canvas */}
        <div className="relative min-w-0 flex-1">
          {ready ? (
            <EditorCanvas />
          ) : (
            <div className="grid h-full place-items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing your canvas…
              </div>
            </div>
          )}
        </div>

        {/* desktop right panel */}
        {rightOpen && (
          <div className="hidden w-[290px] shrink-0 border-l border-border/60 bg-background xl:block">
            <RightPanel />
          </div>
        )}

        {/* mobile overlays */}
        {mobilePanel === 'left' && (
          <div className="absolute inset-y-0 left-0 z-30 flex w-[300px] max-w-[85vw] shadow-2xl lg:hidden">
            <LeftPanel tab={leftTab} setTab={setLeftTab} />
            <button className="absolute -right-9 top-3 grid h-8 w-8 place-items-center rounded-full bg-background shadow" onClick={() => setMobilePanel(null)} aria-label="Close panel">
              ✕
            </button>
          </div>
        )}
        {mobilePanel === 'right' && (
          <div className="absolute inset-y-0 right-0 z-30 w-[290px] max-w-[88vw] border-l border-border/60 bg-background shadow-2xl xl:hidden">
            <RightPanel />
            <button className="absolute -left-9 top-3 grid h-8 w-8 place-items-center rounded-full bg-background shadow" onClick={() => setMobilePanel(null)} aria-label="Close panel">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* mobile bottom bar - safe-area padding keeps it above the home indicator */}
      <div className="flex shrink-0 items-center justify-around border-t border-border/60 bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
        <button
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium text-muted-foreground"
          onClick={() => setMobilePanel(mobilePanel === 'left' ? null : 'left')}
        >
          <Pencil className="h-4 w-4" /> Add
        </button>
        <button
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium text-muted-foreground"
          onClick={() => setMobilePanel(mobilePanel === 'right' ? null : 'right')}
        >
          <PanelRightClose className="h-4 w-4" /> Settings
        </button>
        <button
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium text-muted-foreground"
          onClick={() => useEditor.getState().undo()}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" /> Undo
        </button>
        <button
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium text-muted-foreground"
          onClick={() => useEditor.getState().redo()}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" /> Redo
        </button>
        <button
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 px-3 text-[10px] font-medium text-muted-foreground"
          onClick={() => setShareOpen(true)}
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  )
}
