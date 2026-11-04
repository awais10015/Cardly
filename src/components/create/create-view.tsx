'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, Cake, Heart, Palette, Sparkles } from 'lucide-react'
import { useApp } from '@/lib/stores/app-store'
import { CARD_SIZES } from '@/lib/design/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/layout/footer'

const TYPES = [
  {
    id: 'business',
    icon: Briefcase,
    title: 'Business Card',
    text: 'Professional visiting card with front & back, contact QR and a downloadable vCard.',
    size: 'business',
    withBack: true,
    category: 'business',
    gradient: 'from-slate-700 to-slate-900',
  },
  {
    id: 'invitation',
    icon: Heart,
    title: 'Invitation',
    text: 'Wedding, engagement, party or corporate event invite with structured details.',
    size: 'invitation-portrait',
    withBack: false,
    category: 'wedding',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    id: 'greeting',
    icon: Cake,
    title: 'Greeting Card',
    text: 'Birthday wishes, Eid & Ramadan greetings, thank-you notes and celebrations.',
    size: 'greeting-landscape',
    withBack: false,
    category: 'greeting',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'custom',
    icon: Palette,
    title: 'Custom Canvas',
    text: 'A blank card in any size — build exactly what you imagine from scratch.',
    size: 'greeting-square',
    withBack: false,
    category: 'custom',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
] as const

export function CreateView() {
  const { navigate } = useApp()
  const [size, setSize] = React.useState<string>('invitation-portrait')
  const [withBack, setWithBack] = React.useState(false)

  const start = (t: (typeof TYPES)[number]) => {
    const chosen = t.id === 'custom' ? size : t.size
    const back = t.id === 'business' ? true : t.id === 'custom' ? withBack : t.withBack
    navigate('editor', `new:${chosen}:${back ? 'back' : 'front'}:${t.category}`)
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-10 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            What are you creating today?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Pick a card type to open the editor. You can start from a template at any time.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TYPES.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => start(t)}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-400/50 hover:shadow-xl hover:shadow-violet-600/10"
            >
              <div className="flex items-start justify-between">
                <div className={cn('grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br p-3.5 text-white shadow-md transition-transform group-hover:scale-110', t.gradient)}>
                  <t.icon className="h-6 w-6" />
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition-all group-hover:border-violet-400 group-hover:bg-violet-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold">{t.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                <Sparkles className="h-3 w-3 text-violet-500" />
                {CARD_SIZES[t.size].label} · {CARD_SIZES[t.size].hint}
              </p>
            </motion.button>
          ))}
        </div>

        {size && (
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/70 bg-card p-6">
            <p className="text-sm font-semibold">Custom canvas options</p>
            <p className="mt-1 text-xs text-muted-foreground">Applies when you choose “Custom Canvas”.</p>
            <div className="mt-4 flex flex-wrap items-end gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Canvas size</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CARD_SIZES).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => setSize(key)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                        size === key
                          ? 'border-transparent bg-primary text-primary-foreground'
                          : 'border-border/70 text-muted-foreground hover:bg-accent',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2.5 pb-1">
                <Switch id="back-side" checked={withBack} onCheckedChange={setWithBack} />
                <Label htmlFor="back-side" className="text-xs text-muted-foreground">
                  Two-sided design
                </Label>
              </div>
              <Button
                className="ml-auto rounded-full"
                onClick={() => navigate('editor', `new:${size}:${withBack ? 'back' : 'front'}:custom`)}
              >
                Start blank <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
