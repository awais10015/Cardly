'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeftRight, Download, Loader2, Share2, Sparkles,
} from 'lucide-react'
import { publicApi } from '@/lib/api-client'
import { ScaledCardAuto } from '@/lib/design/renderer'
import { exportPng, shareViaWebShare, useAsyncTask } from '@/lib/design/export'
import type { CardDoc } from '@/lib/design/types'
import { useApp } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'

export function PublicCardView({ slug }: { slug: string }) {
  const { navigate } = useApp()
  const [card, setCard] = React.useState<CardDoc | null>(null)
  const [state, setState] = React.useState<'loading' | 'ready' | 'missing'>('loading')
  const [side, setSide] = React.useState<'front' | 'back'>('front')
  const { running, run } = useAsyncTask()

  React.useEffect(() => {
    if (!slug) {
      setState('missing')
      return
    }
    setState('loading')
    publicApi
      .getCard(slug)
      .then(({ card }) => {
        setCard(card)
        setState('ready')
      })
      .catch(() => setState('missing'))
  }, [slug])

  if (state === 'loading') {
    return (
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading card…
        </div>
      </main>
    )
  }

  if (state === 'missing' || !card) {
    return (
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold">This card is not available</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The link may be wrong, or the owner turned the public link off.
          </p>
          <Button className="mt-5 rounded-full" onClick={() => navigate('create')}>
            <Sparkles className="h-4 w-4" /> Create your own card
          </Button>
        </div>
      </main>
    )
  }

  const hasBack = Boolean(card.design.back)

  return (
    <main className="hero-glow relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />

      <motion.div
        key={side}
        initial={{ opacity: 0, y: 24, rotateY: side === 'back' ? -8 : 8 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        className="relative z-10 w-full"
      >
        <ScaledCardAuto design={card.design} side={side} maxWidth={760} maxHeight={520} radius={24} />
      </motion.div>

      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2.5">
        {hasBack && (
          <Button variant="outline" className="rounded-full" onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}>
            <ArrowLeftRight className="h-4 w-4" /> {side === 'front' ? 'See back' : 'See front'}
          </Button>
        )}
        <Button
          className="rounded-full shadow-md shadow-violet-600/25"
          disabled={running}
          onClick={() =>
            run(async () => {
              try {
                await exportPng(card.design, side, card.title)
                toast.success('PNG downloaded')
              } catch {
                toast.error('Could not export the card.')
              }
            })
          }
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PNG
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={async () => {
            const res = await shareViaWebShare({ title: card.title, text: 'Made with Cardly', url: window.location.href })
            if (res === 'unsupported') {
              await navigator.clipboard.writeText(window.location.href).catch(() => {})
              toast.success('Link copied to clipboard')
            }
          }}
        >
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>

      <div className="relative z-10 mt-10 rounded-2xl border border-border/70 bg-card/80 px-5 py-4 text-center shadow-sm backdrop-blur">
        <p className="text-sm font-semibold">{card.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Shared with a public Cardly link</p>
        <Button variant="link" className="mt-1 h-auto p-0 text-xs text-violet-600 dark:text-violet-400" onClick={() => navigate('create')}>
          Create your own beautiful card →
        </Button>
      </div>
    </main>
  )
}
