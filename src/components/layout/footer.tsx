'use client'

import { Instagram, Twitter, Linkedin, Github, Sparkles } from 'lucide-react'
import { Logo } from './navbar'
import { useApp } from '@/lib/stores/app-store'

const columns = [
  {
    title: 'Product',
    items: [
      { label: 'Templates', view: 'templates' as const },
      { label: 'Create a card', view: 'create' as const },
      { label: 'Dashboard', view: 'dashboard' as const },
      { label: 'Pricing', view: 'pricing' as const },
    ],
  },
]

export function Footer() {
  const { navigate } = useApp()
  return (
    <footer className="mt-auto border-t border-border/60 bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Create beautiful business cards, invitations and greeting cards in minutes — then share them with the
              world through downloads, public links or QR codes.
            </p>
            <div className="mt-5 flex gap-2">
              {[Instagram, Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#/"
                  onClick={(e) => e.preventDefault()}
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate(item.view)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold">Share everywhere</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>PNG · JPG · PDF export</li>
              <li>Public card links</li>
              <li>QR code sharing</li>
              <li>vCard contact files</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Cardly Studio. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            Crafted for moments that matter
          </p>
        </div>
      </div>
    </footer>
  )
}
