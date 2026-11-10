'use client'

import * as React from 'react'
import { ArrowLeft, Crown, Heart, Layers, Palette, Ruler, Sparkles } from 'lucide-react'
import { getTemplate, templateOrientation } from '@/lib/design/templates'
import { CATEGORY_META } from '@/lib/design/types'
import { ScaledCardAuto } from '@/lib/design/renderer'
import { useApp } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function TemplateDetailView({ id }: { id?: string }) {
  const { navigate, favorites, toggleFavorite } = useApp()
  const tpl = id ? getTemplate(id) : undefined
  const [side, setSide] = React.useState<'front' | 'back'>('front')
  const fav = tpl ? favorites.includes(tpl.id) : false

  if (!tpl) {
    return (
      <main className="grid flex-1 place-items-center px-4 py-24 text-center">
        <div>
          <p className="text-lg font-semibold">Template not found</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate('templates')}>
            Back to templates
          </Button>
        </div>
      </main>
    )
  }

  const meta = CATEGORY_META[tpl.category]
  const orientation = templateOrientation(tpl)
  const hasBack = Boolean(tpl.design.back)

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-8 sm:px-6">
        <Button variant="ghost" className="-ml-2 rounded-full" onClick={() => navigate('templates')}>
          <ArrowLeft className="h-4 w-4" /> All templates
        </Button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* preview */}
          <div className="checker-bg relative grid grid-cols-1 min-h-[420px] place-items-center overflow-hidden rounded-3xl border border-border/70 p-8">
            <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-medium capitalize text-white backdrop-blur">
              {side}
            </div>
            {hasBack && (
              <div className="absolute right-4 top-4 flex rounded-full bg-black/45 p-1 backdrop-blur">
                {(['front', 'back'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={cn(
                      'rounded-full px-3.5 py-1 text-xs font-medium capitalize text-white transition-colors',
                      side === s && 'bg-white text-slate-900',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="max-h-[620px] w-full">
              <ScaledCardAuto design={tpl.design} side={side} maxWidth={520} maxHeight={600} radius={24} />
            </div>
          </div>

          {/* details */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full capitalize">
                {meta.label}
              </Badge>
              <Badge variant="outline" className="rounded-full capitalize">
                {tpl.style}
              </Badge>
              <Badge variant="outline" className="rounded-full capitalize">
                {orientation}
              </Badge>
              {tpl.isPro && (
                <Badge className="rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-400">
                  <Crown className="h-3 w-3" /> Pro template
                </Badge>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {tpl.name}
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {meta.description} Open this template in the live editor to change every text, color and element — your
              edits never touch the original.
            </p>

            <div className="mt-6 grid gap-3 rounded-2xl border border-border/70 bg-card p-5 text-sm sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-1.5 font-medium"><Ruler className="h-3.5 w-3.5 text-violet-500" /> Size</p>
                <p className="mt-1 text-muted-foreground">
                  {tpl.design.width} × {tpl.design.height} px
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-medium"><Layers className="h-3.5 w-3.5 text-violet-500" /> Sides</p>
                <p className="mt-1 text-muted-foreground">{hasBack ? 'Front & back' : 'Single side'}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-medium"><Palette className="h-3.5 w-3.5 text-violet-500" /> Style</p>
                <p className="mt-1 capitalize text-muted-foreground">{tpl.style}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-12 rounded-full px-7 text-base shadow-lg shadow-violet-600/25"
                onClick={() => navigate('editor', `tpl:${tpl.id}`)}
              >
                <Sparkles className="h-4.5 w-4.5" /> Use this template
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-6"
                onClick={() => toggleFavorite(tpl.id)}
              >
                <Heart className={cn('h-4 w-4', fav && 'fill-rose-500 text-rose-500')} />
                {fav ? 'Saved' : 'Save'}
              </Button>
            </div>

            <Separator className="my-8" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What you can customize</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {['Every text, font & color', 'Backgrounds, gradients & patterns', 'Photos, logos & stickers', 'Icons, shapes & QR codes'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
