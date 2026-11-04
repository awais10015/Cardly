'use client'

import * as React from 'react'
import { Heart, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { CATEGORY_META, CATEGORY_ORDER, type CardCategory } from '@/lib/design/types'
import { TEMPLATES, templateOrientation, type CardTemplate } from '@/lib/design/templates'
import { ScaledCard } from '@/lib/design/renderer'
import { useApp } from '@/lib/stores/app-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Footer } from '@/components/layout/footer'

const STYLES = ['modern', 'minimal', 'luxury', 'creative', 'classic', 'playful'] as const
const ORIENTATIONS = ['landscape', 'portrait', 'square'] as const

export function TemplateCard({ tpl, showCategory = true }: { tpl: CardTemplate; showCategory?: boolean }) {
  const { navigate, favorites, toggleFavorite } = useApp()
  const fav = favorites.includes(tpl.id)
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-violet-600/10">
        <button
          onClick={() => navigate('template', tpl.id)}
          className="block w-full cursor-pointer"
          aria-label={`Open the ${tpl.name} template`}
        >
          <ScaledCard design={tpl.design} maxWidth={430} maxHeight={420} radius={0} shadow={false} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(tpl.id)
          }}
          aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
          className={cn(
            'absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow backdrop-blur transition-all hover:scale-110 dark:bg-slate-900/85',
            fav ? 'text-rose-500' : 'text-slate-500',
          )}
        >
          <Heart className={cn('h-4 w-4', fav && 'fill-current')} />
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <Button
            size="sm"
            className="pointer-events-auto rounded-full bg-white text-slate-900 shadow-lg hover:bg-violet-50"
            onClick={(e) => {
              e.stopPropagation()
              navigate('editor', `tpl:${tpl.id}`)
            }}
          >
            <Sparkles className="h-3.5 w-3.5" /> Customize
          </Button>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{tpl.name}</p>
          {showCategory && (
            <p className="text-xs capitalize text-muted-foreground">{CATEGORY_META[tpl.category].label}</p>
          )}
        </div>
        {tpl.isPro && <Badge className="shrink-0 rounded-full bg-amber-400/15 text-[10px] font-semibold text-amber-600 dark:text-amber-400">PRO</Badge>}
      </div>
    </div>
  )
}

export function TemplatesView() {
  const routeId = useApp((s) => s.route.id)
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState<CardCategory | 'all'>(
    routeId && CATEGORY_ORDER.includes(routeId as CardCategory) ? (routeId as CardCategory) : 'all',
  )
  const [style, setStyle] = React.useState<string>('all')
  const [orientation, setOrientation] = React.useState<string>('all')

  React.useEffect(() => {
    if (routeId && CATEGORY_ORDER.includes(routeId as CardCategory)) setCategory(routeId as CardCategory)
  }, [routeId])

  const filtered = React.useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (style !== 'all' && t.style !== style) return false
      if (orientation !== 'all' && templateOrientation(t) !== orientation) return false
      if (query) {
        const q = query.toLowerCase()
        if (!t.name.toLowerCase().includes(q) && !CATEGORY_META[t.category].label.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [query, category, style, orientation])

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Template library
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {TEMPLATES.length} professionally designed templates across {CATEGORY_ORDER.length - 1} categories. Save
            favorites with the heart, or open one straight in the editor.
          </p>
        </div>

        {/* filters */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates…"
                className="rounded-full pl-9"
                aria-label="Search templates"
              />
            </div>
            <div className="flex gap-2">
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="w-[150px] rounded-full" aria-label="Filter by style">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All styles</SelectItem>
                  {STYLES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger className="w-[160px] rounded-full" aria-label="Filter by orientation">
                  <SelectValue placeholder="Orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orientations</SelectItem>
                  {ORIENTATIONS.map((o) => (
                    <SelectItem key={o} value={o} className="capitalize">
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="slim-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Category filter">
            <FilterChip active={category === 'all'} onClick={() => setCategory('all')} label="All" />
            {CATEGORY_ORDER.filter((c) => c !== 'custom').map((c) => (
              <FilterChip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
                label={CATEGORY_META[c].plural}
              />
            ))}
          </div>
        </div>

        {/* grid */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-lg font-semibold">No templates match those filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different category or clear the search.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => {
                setQuery('')
                setCategory('all')
                setStyle('all')
                setOrientation('all')
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-transparent bg-primary text-primary-foreground shadow-md shadow-violet-600/20'
          : 'border-border/70 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {label}
    </button>
  )
}
