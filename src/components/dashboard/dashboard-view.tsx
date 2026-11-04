'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Copy, Eye, FileEdit, Globe, Heart, Loader2, MoreVertical, Plus, Search, Sparkles,
  Trash2,
} from 'lucide-react'
import { cardsApi } from '@/lib/api-client'
import { ScaledCard } from '@/lib/design/renderer'
import { TEMPLATES, type CardTemplate } from '@/lib/design/templates'
import { CATEGORY_META, type CardCategory, type CardDoc } from '@/lib/design/types'
import { useApp } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TemplateCard } from '@/components/templates/templates-view'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'published' | 'draft' | CardCategory

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All cards' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
  { id: 'business', label: 'Business' },
  { id: 'wedding', label: 'Invitations' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'greeting', label: 'Greetings' },
  { id: 'eid', label: 'Eid' },
]

export function DashboardView() {
  const user = useApp((s) => s.user)
  const { navigate, favorites } = useApp()
  const [cards, setCards] = React.useState<CardDoc[] | null>(null)
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<Filter>('all')
  const [preview, setPreview] = React.useState<CardDoc | null>(null)
  const [toDelete, setToDelete] = React.useState<CardDoc | null>(null)

  const load = React.useCallback(async () => {
    try {
      const { cards: list } = await cardsApi.list()
      setCards(list)
    } catch (err) {
      toast.error((err as Error).message)
      setCards([])
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const filtered = React.useMemo(() => {
    if (!cards) return []
    return cards.filter((c) => {
      if (filter === 'published' && c.status !== 'published') return false
      if (filter === 'draft' && c.status !== 'draft') return false
      if (filter !== 'all' && filter !== 'published' && filter !== 'draft' && c.category !== filter) return false
      if (query && !c.title.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [cards, filter, query])

  const stats = React.useMemo(() => {
    const total = cards?.length ?? 0
    const published = cards?.filter((c) => c.status === 'published').length ?? 0
    return { total, published, drafts: total - published, favorites: favorites.length }
  }, [cards, favorites])

  const duplicate = async (card: CardDoc) => {
    try {
      await cardsApi.duplicate(card.id)
      toast.success('Card duplicated')
      void load()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const togglePublish = async (card: CardDoc) => {
    try {
      const { card: updated } = await cardsApi.update(card.id, {
        publish: card.status !== 'published',
        unpublish: card.status === 'published',
      })
      toast.success(updated.status === 'published' ? 'Card published — link is live' : 'Card unpublished')
      void load()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const remove = async (card: CardDoc) => {
    try {
      await cardsApi.remove(card.id)
      toast.success('Card deleted')
      setToDelete(null)
      void load()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const favoriteTemplates = favorites.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean) as CardTemplate[]

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      {/* welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your cards, templates and shares.</p>
        </div>
        <Button className="rounded-full shadow-md shadow-violet-600/20" onClick={() => navigate('create')}>
          <Plus className="h-4 w-4" /> Create New Card
        </Button>
      </div>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total cards', value: stats.total, icon: Sparkles, tint: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
          { label: 'Published', value: stats.published, icon: Globe, tint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
          { label: 'Drafts', value: stats.drafts, icon: FileEdit, tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-500' },
          { label: 'Saved templates', value: stats.favorites, icon: Heart, tint: 'bg-rose-500/10 text-rose-500' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4">
            <span className={cn('grid h-10 w-10 place-items-center rounded-xl', s.tint)}>
              <s.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-xl font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* search + filters */}
      <div className="mt-8 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your cards…"
            className="rounded-full pl-9"
            aria-label="Search cards"
          />
        </div>
        <div className="slim-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                filter === f.id
                  ? 'border-transparent bg-primary text-primary-foreground shadow-md shadow-violet-600/20'
                  : 'border-border/70 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* cards grid */}
      {cards === null ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-border/70 px-6 py-16 text-center">
          <Sparkles className="h-8 w-8 text-violet-400" />
          <p className="mt-4 text-lg font-semibold">
            {cards.length === 0 ? 'No cards yet' : 'Nothing matches this filter'}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {cards.length === 0
              ? 'Create your first card — pick a template and make it yours in minutes.'
              : 'Try another category or clear the search.'}
          </p>
          {cards.length === 0 && (
            <Button className="mt-5 rounded-full" onClick={() => navigate('create')}>
              <Plus className="h-4 w-4" /> Create your first card
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-600/10"
            >
              <button
                className="checker-bg relative block w-full cursor-pointer"
                onClick={() => setPreview(card)}
                aria-label={`Preview ${card.title}`}
              >
                <div className="flex justify-center p-4 pb-0">
                  <ScaledCard design={card.design} maxWidth={330} maxHeight={210} radius={14} />
                </div>
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{card.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_META[card.category as CardCategory]?.label ?? card.category} · edited{' '}
                      {format(new Date(card.updatedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Card actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('editor', card.id)}>
                        <FileEdit className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPreview(card)}>
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void duplicate(card)}>
                        <Copy className="h-3.5 w-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void togglePublish(card)}>
                        <Globe className="h-3.5 w-3.5" />
                        {card.status === 'published' ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      {card.status === 'published' && card.slug && (
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/#/card/${card.slug}`)
                            toast.success('Public link copied')
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Copy public link
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose-600 focus:text-rose-600 dark:text-rose-400" onClick={() => setToDelete(card)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge
                    className={cn(
                      'rounded-full text-[10px] font-semibold',
                      card.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-secondary text-secondary-foreground',
                    )}
                  >
                    {card.status === 'published' ? '● Published' : '○ Draft'}
                  </Badge>
                  <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs" onClick={() => navigate('editor', card.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs" onClick={() => setPreview(card)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* saved templates */}
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Saved templates
          </h2>
          <Button variant="ghost" className="rounded-full text-violet-600 dark:text-violet-400" onClick={() => navigate('templates')}>
            Browse all <Heart className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
        {favoriteTemplates.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
            Tap the ♥ on any template in the library to keep it here.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {favoriteTemplates.map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} showCategory={false} />
            ))}
          </div>
        )}
      </section>

      {/* preview dialog */}
      <Dialog open={Boolean(preview)} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="pr-6">{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-xl bg-secondary/40 p-6">
              <ScaledCard design={preview.design} maxWidth={460} maxHeight={480} radius={18} />
            </div>
          )}
          {preview?.status === 'published' && preview.slug && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setPreview(null)
                navigate('card', preview.slug!)
              }}
            >
              <Globe className="h-4 w-4" /> View public page
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <AlertDialog open={Boolean(toDelete)} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{toDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the card and disables its public link if it had one. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => toDelete && void remove(toDelete)}>
              {cards === null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
