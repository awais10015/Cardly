'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/stores/app-store'
import { authApi } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Templates', view: 'templates' as const },
  { label: 'Pricing', view: 'pricing' as const },
]

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="#/"
      onClick={(e) => {
        e.preventDefault()
        useApp.getState().navigate('home')
      }}
      className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-600/25">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Cardly
      </span>
    </Link>
  )
}

export function Navbar() {
  const { route, navigate, user, setUser, openAuth } = useApp()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const signOut = async () => {
    try {
      await authApi.logout()
      setUser(null)
      navigate('home')
      toast.success('Signed out — see you soon!')
    } catch {
      toast.error('Could not sign out.')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <button
                key={l.view}
                onClick={() => navigate(l.view)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  route.name === l.view && 'bg-accent text-accent-foreground',
                )}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-ring focus-visible:ring-2" aria-label="Account menu">
                  <Avatar className="h-9 w-9 border border-border/70">
                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xs font-semibold text-white">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">
                  {user.name}
                  <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('dashboard')}>My dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('create')}>Create new card</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('profile')}>Profile settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('auth')}>
                Sign in
              </Button>
              <Button
                onClick={() => openAuth('Create an account to save and share your cards — or try the instant demo.')}
                className="rounded-full shadow-md shadow-violet-600/20"
              >
                Get started
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-border/60 bg-background/95 px-4 py-3 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <button
              key={l.view}
              onClick={() => {
                navigate(l.view)
                setMobileOpen(false)
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {l.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
