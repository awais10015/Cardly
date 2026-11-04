'use client'

import * as React from 'react'
import { useApp } from '@/lib/stores/app-store'
import { authApi } from '@/lib/api-client'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AuthDialog } from '@/components/layout/auth-dialog'
import { Hero, ShowcaseStrip } from '@/components/landing/hero'
import {
  Categories, HowItWorks, TemplateShowcase, Features, Testimonials, FinalCta,
} from '@/components/landing/sections'
import { TemplatesView } from '@/components/templates/templates-view'
import { TemplateDetailView } from '@/components/templates/template-detail-view'
import { CreateView } from '@/components/create/create-view'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { EditorView } from '@/components/editor/editor-view'
import { AuthView } from '@/components/views/auth-view'
import { ProfileView } from '@/components/views/profile-view'
import { PricingView } from '@/components/views/pricing-view'
import { PublicCardView } from '@/components/views/public-card-view'

function Landing() {
  return (
    <>
      <main>
        <Hero />
        <ShowcaseStrip />
        <Categories />
        <HowItWorks />
        <TemplateShowcase />
        <Features />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}

function CurrentView() {
  const route = useApp((s) => s.route)
  const user = useApp((s) => s.user)

  switch (route.name) {
    case 'templates':
      return <TemplatesView />
    case 'template':
      return <TemplateDetailView id={route.id} />
    case 'create':
      return <CreateView />
    case 'dashboard':
      return user ? <DashboardView /> : <AuthGate reason="Sign in to see your dashboard." />
    case 'editor':
      return <EditorView cardId={route.id ?? null} />
    case 'auth':
      return <AuthView />
    case 'profile':
      return user ? <ProfileView /> : <AuthGate reason="Sign in to manage your profile." />
    case 'pricing':
      return <PricingView />
    case 'card':
      return <PublicCardView slug={route.id ?? ''} />
    case 'home':
    default:
      return <Landing />
  }
}

function AuthGate({ reason }: { reason: string }) {
  const { openAuth, closeAuth, authChecked, user } = useApp()

  React.useEffect(() => {
    if (!authChecked) return
    if (user) closeAuth()
    else openAuth(reason)
  }, [authChecked, user, reason, openAuth, closeAuth])

  if (!authChecked) {
    return (
      <main className="grid flex-1 place-items-center px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          Loading your studio…
        </div>
      </main>
    )
  }
  if (user) return null
  return (
    <main className="grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <p className="text-lg font-semibold">This area needs an account</p>
        <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
      </div>
    </main>
  )
}

export default function Home() {
  const { setRouteFromHash, setUser, setAuthChecked } = useApp()
  const routeName = useApp((s) => s.route.name)
  const isEditor = routeName === 'editor'

  // initial hash + session bootstrap
  React.useEffect(() => {
    setRouteFromHash()
    const onPop = () => setRouteFromHash()
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true))
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [setRouteFromHash, setUser, setAuthChecked])

  return (
    <div className="flex min-h-screen flex-col">
      {!isEditor && <Navbar />}
      <React.Suspense fallback={<div className="grid flex-1 place-items-center text-sm text-muted-foreground">Loading…</div>}>
        <CurrentView />
      </React.Suspense>
      <AuthDialog />
    </div>
  )
}
