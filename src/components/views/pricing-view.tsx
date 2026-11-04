'use client'

import { Check, Sparkles } from 'lucide-react'
import { useApp } from '@/lib/stores/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/layout/footer'
import { SectionHeading } from '@/components/landing/sections'
import { cn } from '@/lib/utils'

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'Everything you need to share your first cards.',
    features: ['All core templates', 'Live drag-and-drop editor', 'PNG & JPG export', 'Public link sharing', 'QR code sharing'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    tagline: 'For freelancers and creators who share constantly.',
    features: [
      'Everything in Free',
      'Premium Pro templates',
      'Print-ready PDF export',
      'vCard contact downloads',
      'Two-sided business cards',
      'Remove Cardly badge on public pages',
    ],
    cta: 'Go Pro',
    highlight: true,
  },
  {
    name: 'Studio',
    price: '$29',
    period: 'per month',
    tagline: 'For teams and event studios with volume needs.',
    features: ['Everything in Pro', '5 team seats', 'Brand kit & custom fonts', 'Priority support', 'Template submissions'],
    cta: 'Contact us',
    highlight: false,
  },
]

export function PricingView() {
  const { navigate, openAuth } = useApp()
  return (
    <>
      <main className="flex-1 pb-20 pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans that grow with you"
            subtitle="Every plan includes the full editor, templates and sharing. Upgrade only when you need more."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative flex flex-col rounded-3xl border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl',
                  tier.highlight
                    ? 'border-violet-500/60 shadow-lg shadow-violet-600/10 ring-1 ring-violet-500/40'
                    : 'border-border/70',
                )}
              >
                {tier.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 text-white shadow">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </Badge>
                )}
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.tagline}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn('mt-7 w-full rounded-full', tier.highlight && 'shadow-md shadow-violet-600/25')}
                  variant={tier.highlight ? 'default' : 'outline'}
                  onClick={() => (tier.name === 'Studio' ? openAuth('Leave us your email — the team will reach out!') : navigate('create'))}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
            This is a demo deployment — plans are illustrative and no payment is collected. The Free experience in this
            build is fully unlocked so you can try everything.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
