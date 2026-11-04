'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { KeyRound, Loader2, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { useApp } from '@/lib/stores/app-store'
import { authApi } from '@/lib/api-client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/layout/navbar'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
const signupSchema = z.object({
  name: z.string().min(2, 'Tell us your name (2+ characters)'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Use at least 6 characters'),
})
type LoginForm = z.infer<typeof loginSchema>
type SignupForm = z.infer<typeof signupSchema>

export function AuthView() {
  const { user, setUser, navigate } = useApp()
  const [busy, setBusy] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<'login' | 'signup'>('login')

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema), defaultValues: { name: '', email: '', password: '' } })

  const onLogin = loginForm.handleSubmit(async (values) => {
    setBusy('login')
    try {
      const { user } = await authApi.login(values.email, values.password)
      setUser(user)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate('dashboard')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  })

  const onSignup = signupForm.handleSubmit(async (values) => {
    setBusy('signup')
    try {
      const { user } = await authApi.signup(values.name, values.email, values.password)
      setUser(user)
      toast.success('Account created — happy designing!')
      navigate('dashboard')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  })

  const onDemo = async () => {
    setBusy('demo')
    try {
      const { user } = await authApi.demo()
      setUser(user)
      toast.success('Demo account ready!')
      navigate('dashboard')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="hero-glow flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Card className="overflow-hidden border-border/70 shadow-xl shadow-violet-600/5">
          <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-7 text-white">
            <Logo className="text-white [&_span:last-child]:text-white" />
            <h1 className="mt-4 text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {user ? `You're signed in, ${user.name.split(' ')[0]}` : 'Your card studio awaits'}
            </h1>
            <p className="mt-1 text-sm text-violet-100">
              {user ? user.email : 'Sign in to save cards, publish links and share QR codes.'}
            </p>
          </div>
          <CardContent className="p-6">
            {user ? (
              <div className="space-y-3">
                <Button className="w-full rounded-full" onClick={() => navigate('dashboard')}>
                  Go to my dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={async () => {
                    await authApi.logout()
                    setUser(null)
                    toast.success('Signed out')
                  }}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign in</TabsTrigger>
                    <TabsTrigger value="signup">Create account</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-4">
                    <Form {...loginForm}>
                      <form onSubmit={onLogin} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full rounded-full" disabled={busy !== null}>
                          {busy === 'login' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                          Sign in
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-4">
                    <Form {...signupForm}>
                      <form onSubmit={onSignup} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full name</FormLabel>
                              <FormControl>
                                <Input placeholder="Alexandra Morgan" autoComplete="name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="At least 6 characters" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full rounded-full" disabled={busy !== null}>
                          {busy === 'signup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                          Create account
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button variant="outline" className="w-full rounded-full" onClick={onDemo} disabled={busy !== null}>
                  {busy === 'demo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Try the instant demo account
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-violet-500" /> demo@cardly.app · preloaded with sample cards
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
