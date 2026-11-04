'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Download, Layers, Link2, MousePointer2, Palette, QrCode,
  Smartphone, Sparkles, Star, Users,
} from 'lucide-react'
import { CATEGORY_META, type CardCategory } from '@/lib/design/types'
import { TEMPLATES, type CardTemplate } from '@/lib/design/templates'
import { ScaledCard, getIcon } from '@/lib/design/renderer'
import { useApp } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* ----------------------------- categories ---------------------------- */

const CATEGORY_CARDS: CardCategory[] = [
  'business', 'wedding', 'birthday', 'greeting', 'eid', 'anniversary', 'corporate', 'thank-you',
]

export function Categories() {
  const { navigate } = useApp()
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6" id="categories">
      <SectionHeading
        eyebrow="Card categories"
        title="Every occasion, beautifully covered"
        subtitle="From polished business cards to heartfelt Eid greetings — pick a category and make it yours."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_CARDS.map((cat, i) => {
          const meta = CATEGORY_META[cat]
          const Icon = getIcon(meta.icon) ?? Sparkles
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.07 }}
              onClick={() => navigate('templates', cat)}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet-600/10"
            >
              <div
                className={cn(
                  'grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                  meta.gradient,
                )}
              >
                <Icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{meta.plural}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                Explore
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/5 transition-transform duration-300 group-hover:scale-[2.4]" />
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

/* ----------------------------- how it works -------------------------- */

const STEPS = [
  {
    icon: MousePointer2,
    title: 'Choose a template',
    text: 'Browse professionally designed templates for business, invitations and greetings — or start from a blank canvas.',
  },
  {
    icon: Palette,
    title: 'Customize your card',
    text: 'Drag, edit and restyle everything in the live editor: text, photos, backgrounds, shapes, icons and QR codes.',
  },
  {
    icon: QrCode,
    title: 'Download or share it',
    text: 'Export crisp PNG, JPG or PDF files, publish a public link, or generate a QR code — ready for print and screens.',
  },
]

export function HowItWorks() {
  return (
    <section className="border-y border-border/60 bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to shared card in three steps"
          subtitle="No design skills needed — the editor does the heavy lifting while you stay in control."
        />
        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-9 hidden border-t-2 border-dashed border-violet-500/25 md:block" aria-hidden />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto grid h-[72px] w-[72px] place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-600/25">
                <step.icon className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-card text-xs font-bold text-violet-600 dark:text-violet-400">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------- template showcase ------------------------ */

export function TemplateShowcase() {
  const { navigate } = useApp()
  const picks: CardTemplate[] = React.useMemo(() => {
    const ids = ['tpl-wed-blush', 'tpl-biz-noir', 'tpl-bday-confetti', 'tpl-eid-emerald', 'tpl-biz-waves', 'tpl-eng-rose', 'tpl-grad-gold', 'tpl-thanks-blush']
    return ids.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean) as CardTemplate[]
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Template showcase"
          title="Professionally designed, ready to customize"
          subtitle="Every template is a real, editable design — open one and it loads straight into the editor."
          align="left"
        />
        <Button variant="outline" className="rounded-full" onClick={() => navigate('templates')}>
          View all templates <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {picks.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            className="group"
          >
            <button
              onClick={() => navigate('template', tpl.id)}
              className="block w-full overflow-hidden rounded-2xl border border-border/70 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-violet-600/10"
              aria-label={`Open the ${tpl.name} template`}
            >
              <div className="relative">
                <ScaledCard design={tpl.design} maxWidth={400} maxHeight={330} radius={0} shadow={false} />
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-lg">
                    <Palette className="h-3.5 w-3.5" /> Customize
                  </span>
                </div>
              </div>
            </button>
            <div className="mt-3 flex items-center justify-between px-0.5">
              <div>
                <p className="text-sm font-semibold leading-tight">{tpl.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{CATEGORY_META[tpl.category].label}</p>
              </div>
              {tpl.isPro && <Badge className="rounded-full bg-amber-400/15 text-[10px] font-semibold text-amber-600 dark:text-amber-400">PRO</Badge>}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------- features ---------------------------- */

const FEATURES = [
  {
    icon: Layers,
    title: 'A real drag-and-drop editor',
    text: 'Move, resize, rotate and layer every element with snapping guides, undo/redo and front-back sides for business cards.',
    accent: 'from-violet-500 to-purple-600',
  },
  {
    icon: Download,
    title: 'Print-ready exports',
    text: 'Download high-resolution PNG and JPG files or a PDF sized exactly to your card — sharp at 300 DPI.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Link2,
    title: 'Public links & QR codes',
    text: 'Publish any card to a unique shareable link, complete with an auto-generated QR code and Web Share support.',
    accent: 'from-fuchsia-500 to-pink-600',
  },
  {
    icon: Smartphone,
    title: 'Looks great everywhere',
    text: 'Responsive layouts, dark mode and touch-friendly controls mean you can design on the couch or at your desk.',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    icon: Users,
    title: 'Smart invitation fields',
    text: 'Fill structured details — venue, date, RSVP, dress code — once and watch every bound element update instantly.',
    accent: 'from-cyan-500 to-sky-600',
  },
  {
    icon: QrCode,
    title: 'Digital business cards',
    text: 'Front & back designs, contact QR codes and one-tap downloadable vCard files for effortless networking.',
    accent: 'from-indigo-400 to-violet-600',
  },
]

export function Features() {
  return (
    <section className="border-y border-border/60 bg-secondary/40 py-20" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why Cardly"
          title="A polished product, not a template toy"
          subtitle="Everything is built to work — the editor, the exports and the sharing flows are fully functional."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={cn('grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md', f.accent)}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- testimonials -------------------------- */

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Wedding planner, Delhi',
    quote:
      'I sent our clients a QR-code invitation the same afternoon. They were amazed the whole suite — venue, RSVP, maps — lived in one gorgeous card.',
  },
  {
    name: 'Marcus Chen',
    role: 'Freelance consultant',
    quote:
      'My digital business card with the vCard download wins meetings before I even sit down. The editor took me two minutes to learn.',
  },
  {
    name: 'Amina Yusuf',
    role: 'Community organizer',
    quote:
      'We made 40 personalized Eid greetings with the smart fields and shared them by link. Beautiful typography and zero design experience needed.',
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Loved by creators"
        title="Moments shared with Cardly"
        subtitle="Planners, freelancers and families use Cardly to turn thoughts into shareable cards."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
          >
            <div className="flex gap-0.5 text-amber-400" aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-bold text-white">
                {t.name.split(' ').map((n) => n[0]).join('')}
              </span>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------- CTA -------------------------------- */

export function FinalCta() {
  const { navigate, openAuth } = useApp()
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-500 px-6 py-16 text-center text-white shadow-2xl shadow-violet-600/30 sm:px-12">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <h2 className="relative text-balance text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Your next card is two minutes away
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-violet-100">
          Pick a template, make it yours, and share it with the world — no design experience required.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="h-12 rounded-full bg-white px-8 text-base text-violet-700 shadow-lg hover:bg-violet-50"
            onClick={() => navigate('create')}
          >
            Create Your Card <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-white/40 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
            onClick={() => openAuth('Start with the instant demo account — no signup friction.')}
          >
            Try the demo
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- shared bits --------------------------- */

export function SectionHeading({
  eyebrow, title, subtitle, align = 'center',
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  )
}
