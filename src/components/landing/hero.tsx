'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download, Link2, QrCode, Sparkles, Wand2 } from 'lucide-react'
import { ScaledCard } from '@/lib/design/renderer'
import { TEMPLATES, getTemplate } from '@/lib/design/templates'
import { useApp } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const FLOATERS = ['tpl-biz-noir', 'tpl-wed-blush', 'tpl-bday-confetti', 'tpl-eid-emerald', 'tpl-biz-waves']

export function Hero() {
  const { navigate } = useApp()
  const [active, setActive] = React.useState(1)

  React.useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % FLOATERS.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="hero-glow relative overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-5 gap-1.5 rounded-full border-violet-300/60 bg-violet-500/5 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-500/40 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" /> The digital card studio for every occasion
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Create Beautiful Cards.{' '}
            <span className="text-gradient">Share Moments That Matter.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Design professional business cards, wedding &amp; event invitations and heartfelt greeting cards in a live
            drag-and-drop editor — then download in high resolution or share instantly with a public link and QR code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="group h-12 rounded-full px-7 text-base shadow-lg shadow-violet-600/25 transition-transform hover:scale-[1.03]"
              onClick={() => navigate('create')}
            >
              <Wand2 className="h-4.5 w-4.5" />
              Create Your Card
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 text-base"
              onClick={() => navigate('templates')}
            >
              Explore Templates
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-violet-500" /> PNG · JPG · PDF export</span>
            <span className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5 text-fuchsia-500" /> Public card links</span>
            <span className="flex items-center gap-1.5"><QrCode className="h-3.5 w-3.5 text-emerald-500" /> QR code sharing</span>
          </motion.div>
        </div>

        {/* Interactive floating template showcase */}
        <div className="relative mx-auto mt-14 max-w-5xl sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex items-end justify-center gap-3 sm:gap-5"
          >
            {FLOATERS.map((id, i) => {
              const tpl = getTemplate(id)
              if (!tpl) return null
              const isActive = i === active
              return (
                <motion.div
                  key={id}
                  className="cursor-pointer"
                  animate={{
                    y: isActive ? -18 : [0, -7, 0],
                    scale: isActive ? 1.12 : 1,
                    rotate: i % 2 === 0 ? -1.6 : 1.6,
                  }}
                  transition={
                    isActive
                      ? { type: 'spring', stiffness: 220, damping: 18 }
                      : { duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{ zIndex: isActive ? 20 : 10 - Math.abs(i - 2) }}
                  onClick={() => useApp.getState().navigate('template', id)}
                  role="button"
                  aria-label={`Preview the ${tpl.name} template`}
                >
                  <div
                    className={`overflow-hidden rounded-2xl transition-shadow duration-300 ${
                      isActive ? 'shadow-2xl shadow-violet-600/25 ring-2 ring-violet-500/50' : 'shadow-lg shadow-black/10'
                    }`}
                  >
                    <ScaledCard
                      design={tpl.design}
                      maxWidth={i === 2 ? 210 : 178}
                      maxHeight={isActive ? 260 : 225}
                      radius={22}
                    />
                  </div>
                  <p
                    className={`mt-2.5 text-center text-xs font-medium transition-colors ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {tpl.name}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Live templates rendered in real time — click any card to preview it
          </p>
        </div>
      </div>
    </section>
  )
}

export function ShowcaseStrip() {
  const { navigate } = useApp()
  const picks = ['tpl-wed-emerald', 'tpl-biz-emerald', 'tpl-grad-gold', 'tpl-ann-gold', 'tpl-greet-spring', 'tpl-corp-summit', 'tpl-eng-rose', 'tpl-ramadan-lantern', 'tpl-biz-ivory', 'tpl-bday-glow']
  const loop = [...picks, ...picks]
  return (
    <section aria-label="Template marquee" className="overflow-hidden border-y border-border/60 bg-secondary/40 py-8">
      <div className="relative flex">
        <motion.div
          className="flex shrink-0 gap-5 pr-5"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
        >
          {loop.map((id, i) => {
            const tpl = TEMPLATES.find((t) => t.id === id)
            if (!tpl) return null
            return (
              <button
                key={`${id}-${i}`}
                onClick={() => navigate('template', id)}
                className="shrink-0 overflow-hidden rounded-xl shadow-md shadow-black/10 transition-transform hover:scale-[1.04]"
                aria-label={`Open ${tpl.name} template`}
              >
                <ScaledCard design={tpl.design} maxWidth={150} maxHeight={170} radius={16} />
              </button>
            )
          })}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  )
}
