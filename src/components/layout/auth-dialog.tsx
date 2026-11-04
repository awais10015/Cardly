'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, LogIn, Sparkles, UserPlus, KeyRound } from 'lucide-react'
import { useApp } from '@/lib/stores/app-store'
import { authApi } from '@/lib/api-client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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

export function AuthDialog() {
  const { authOpen, closeAuth, authReason, setUser, navigate } = useApp()
  const [mode, setMode] = React.useState<'login' | 'signup'>('login')
  const [forgotStep, setForgotStep] = React.useState<'idle' | 'sent'>('idle')
  const [forgotEmail, setForgotEmail] = React.useState('')
  const [forgotToken, setForgotToken] = React.useState<string | null>(null)

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema), defaultValues: { name: '', email: '', password: '' } })

  const [busy, setBusy] = React.useState<'login' | 'signup' | 'demo' | 'forgot' | null>(null)

  React.useEffect(() => {
    if (authOpen) {
      setForgotStep('idle')
      setForgotToken(null)
    }
  }, [authOpen])

  const onLogin = loginForm.handleSubmit(async (values) => {
    setBusy('login')
    try {
      const { user } = await authApi.login(values.email, values.password)
      setUser(user)
      closeAuth()
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      loginForm.reset()
      if (navigate && useApp.getState().route.name === 'auth') navigate('dashboard')
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
      closeAuth()
      toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`)
      signupForm.reset()
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
      closeAuth()
      toast.success('Demo account ready — explore the dashboard!')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const onForgot = async () => {
    if (!forgotEmail.includes('@')) {
      toast.error('Enter the email you registered with.')
      return
    }
    setBusy('forgot')
    try {
      const res = await authApi.reset(forgotEmail)
      setForgotStep('sent')
      setForgotToken(res.resetPath)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog open={authOpen} onOpenChange={(v) => (v ? undefined : closeAuth())}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-500 px-6 py-6 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-white">
              <Sparkles className="h-5 w-5" /> Welcome to Cardly
            </DialogTitle>
            <DialogDescription className="text-violet-100">
              {authReason ?? 'Sign in to save your cards, publish them and share QR codes.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              {forgotStep === 'sent' ? (
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    If an account exists for <span className="font-medium text-foreground">{forgotEmail}</span>, a reset
                    link has been generated. This sandbox has no mail provider, so use the button below to set a new
                    password.
                  </p>
                  <ResetWithToken token={forgotToken} onDone={() => setForgotStep('idle')} />
                </div>
              ) : (
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
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <button
                              type="button"
                              onClick={() => setForgotStep('sent')}
                              className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={busy !== null}>
                      {busy === 'login' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      Sign in
                    </Button>
                  </form>
                </Form>
              )}
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
                  <Button type="submit" className="w-full" disabled={busy !== null}>
                    {busy === 'signup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Create account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="my-4 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full" onClick={onDemo} disabled={busy !== null}>
            {busy === 'demo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Try the instant demo account
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Demo comes preloaded with sample cards · demo@cardly.app
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResetWithToken({ token, onDone }: { token: string | null; onDone: () => void }) {
  const [password, setPassword] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('No account was found for that email — try signing up instead.')
      return
    }
    setBusy(true)
    try {
      await authApi.resetConfirm(token, password)
      toast.success('Password updated — you can sign in now.')
      onDone()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        type="password"
        placeholder="New password (6+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        Set new password
      </Button>
    </form>
  )
}
