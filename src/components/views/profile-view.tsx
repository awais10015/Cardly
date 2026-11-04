'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Loader2, LogOut, ShieldCheck } from 'lucide-react'
import { useApp } from '@/lib/stores/app-store'
import { authApi } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Footer } from '@/components/layout/footer'

export function ProfileView() {
  const { user, setUser, navigate } = useApp()
  const [name, setName] = React.useState(user?.name ?? '')
  const [email, setEmail] = React.useState(user?.email ?? '')
  const [savingProfile, setSavingProfile] = React.useState(false)

  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [savingPassword, setSavingPassword] = React.useState(false)

  if (!user) return null

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const { user: updated } = await authApi.updateProfile(name, email)
      setUser(updated)
      toast.success('Profile updated')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Profile settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details and password.</p>

        <Card className="mt-8 border-border/70">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-500 text-base font-bold text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Full name</span>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Email</span>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
              </div>
              <Button type="submit" disabled={savingProfile} className="rounded-full">
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
              </Button>
            </form>

            <Separator />

            <form onSubmit={savePassword} className="space-y-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-violet-600" /> Change password
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Current password</span>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">New password</span>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </label>
              </div>
              <Button type="submit" variant="outline" disabled={savingPassword} className="rounded-full">
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Update password
              </Button>
            </form>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Sign out</p>
                <p className="text-xs text-muted-foreground">You can sign back in any time.</p>
              </div>
              <Button
                variant="destructive"
                className="rounded-full"
                onClick={async () => {
                  await authApi.logout()
                  setUser(null)
                  navigate('home')
                  toast.success('Signed out')
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  )
}
