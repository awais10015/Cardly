'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Check, Copy, Download, FileImage, FileText, Globe, ImageDown, Loader2, QrCode, Share2,
  SquareArrowOutUpRight, IdCard,
} from 'lucide-react'
import { useEditor } from '@/lib/stores/editor-store'
import { useApp } from '@/lib/stores/app-store'
import { cardsApi, publicCardUrl } from '@/lib/api-client'
import { downloadVCard, exportJpg, exportPdf, exportPng, shareViaWebShare, useAsyncTask } from '@/lib/design/export'
import { qrDataUrl } from '@/lib/design/renderer'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export function ShareDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, openAuth } = useApp()
  const editor = useEditor()
  const { running, run } = useAsyncTask()
  const [published, setPublished] = React.useState(editor.status === 'published')
  const [slug, setSlug] = React.useState<string | null>(editor.slug)
  const [copied, setCopied] = React.useState(false)
  const [qr, setQr] = React.useState<string | null>(null)
  const [side, setSide] = React.useState<'front' | 'back'>('front')

  React.useEffect(() => {
    if (open) {
      setPublished(editor.status === 'published')
      setSlug(editor.slug)
    }
  }, [open, editor.status, editor.slug])

  React.useEffect(() => {
    if (published && slug) {
      qrDataUrl(publicCardUrl(slug), '#0f172a', '#ffffff').then(setQr).catch(() => setQr(null))
    } else {
      setQr(null)
    }
  }, [published, slug])

  const link = slug ? publicCardUrl(slug) : ''

  const persist = React.useCallback(
    async (publish?: boolean) => {
      const store = useEditor.getState()
      if (!user) {
        openAuth('Sign in to save this card and unlock sharing.')
        return null
      }
      const payload = {
        title: store.title,
        category: store.category,
        design: store.design,
        business: store.business,
        invitation: store.invitation,
      }
      if (store.cardId) {
        const { card } = await cardsApi.update(store.cardId, { ...payload, publish })
        useEditor.getState().markSaved(card.id, card.slug ?? null, card.status, card.updatedAt)
        window.history.replaceState(null, '', `#/editor/${card.id}`)
        return card
      }
      const { card } = await cardsApi.create({ ...payload, status: publish ? 'published' : 'draft' })
      useEditor.getState().markSaved(card.id, card.slug ?? null, card.status, card.updatedAt)
      window.history.replaceState(null, '', `#/editor/${card.id}`)
      return card
    },
    [user, openAuth],
  )

  const onPublishToggle = async (enable: boolean) => {
    if (enable && !user) {
      openAuth('Sign in to publish this card and unlock sharing.')
      return
    }
    await run(async () => {
      try {
        const card = await persist(enable)
        if (card) {
          setPublished(card.status === 'published')
          setSlug(card.slug ?? null)
          toast.success(
            card.status === 'published'
              ? 'Card published! Your public link is live.'
              : 'Card unpublished — the public link is disabled.',
          )
        }
      } catch (err) {
        toast.error((err as Error).message)
      }
    })
  }

  const copyLink = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link).catch(() => {})
    setCopied(true)
    toast.success('Public link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const onWebShare = async () => {
    if (!link) return
    const res = await shareViaWebShare({
      title: editor.title,
      text: `Check out my card: ${editor.title}`,
      url: link,
    })
    if (res === 'unsupported') {
      copyLink()
    }
  }

  const sides: ('front' | 'back')[] = editor.design.back ? ['front', 'back'] : ['front']

  const doExport = (kind: 'png' | 'jpg' | 'pdf') =>
    run(async () => {
      try {
        // make sure the design is saved before export
        await persist()
        const design = useEditor.getState().design
        const name = useEditor.getState().title
        if (kind === 'png') {
          for (const s of sides) await exportPng(design, s, name)
          toast.success('PNG downloaded at high resolution')
        } else if (kind === 'jpg') {
          for (const s of sides) await exportJpg(design, s, name)
          toast.success('JPG downloaded')
        } else {
          await exportPdf(design, sides, name)
          toast.success('PDF downloaded — ready to print')
        }
      } catch (err) {
        console.error(err)
        toast.error('Export failed. Please try again.')
      }
    })

  const isBusiness = editor.category === 'business' && editor.business

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-violet-600" /> Save &amp; share
          </DialogTitle>
          <DialogDescription>
            Save your card, then download it or share it with a public link and QR code.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="download" className="mt-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">Download</TabsTrigger>
            <TabsTrigger value="link">Public link</TabsTrigger>
            <TabsTrigger value="qr">QR code</TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="mt-4 space-y-4">
            {editor.design.back && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Side</Label>
                <div className="flex rounded-full border border-border/70 p-0.5">
                  {sides.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSide(s)}
                      className={cn(
                        'rounded-full px-3.5 py-1 text-xs font-medium capitalize',
                        side === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2.5">
              <ExportButton icon={FileImage} label="PNG" hint="High-res" running={running} onClick={() => doExport('png')} />
              <ExportButton icon={ImageDown} label="JPG" hint="Compressed" running={running} onClick={() => doExport('jpg')} />
              <ExportButton icon={FileText} label="PDF" hint="Print" running={running} onClick={() => doExport('pdf')} />
            </div>
            {isBusiness && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  downloadVCard(editor.business!, editor.title)
                  toast.success('vCard (.vcf) downloaded — import it into any contacts app')
                }}
              >
                <IdCard className="h-4 w-4" /> Download contact file (.vcf)
              </Button>
            )}
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              PNG &amp; PDF export at {editor.design.width * 2} × {editor.design.height * 2} px — crisp for both
              printing and screens. The card is saved automatically with every export.
            </p>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Publish this card</p>
                <p className="text-xs text-muted-foreground">Anyone with the link can view it.</p>
              </div>
              <Switch checked={published} onCheckedChange={onPublishToggle} disabled={running} aria-label="Publish card" />
            </div>

            {published && slug && (
              <>
                <div className="flex gap-2">
                  <Input readOnly value={link} className="text-xs" onFocus={(e) => e.target.select()} />
                  <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy link">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => window.open(link, '_blank')}>
                    <SquareArrowOutUpRight className="h-4 w-4" /> Open preview
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={onWebShare}>
                    <Share2 className="h-4 w-4" /> Share via device
                  </Button>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  The public page shows your card full-screen with an optional download button. Turn publishing off any
                  time to disable the link, or delete the card from your dashboard.
                </p>
              </>
            )}
          </TabsContent>

          <TabsContent value="qr" className="mt-4 space-y-4">
            {published && slug && qr ? (
              <>
                <div className="flex justify-center">
                  <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
                        <img src={qr} alt="Card QR code" className="h-44 w-44" />
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Scanning opens{' '}
                  <span className="max-w-[220px] truncate font-medium text-foreground">{link}</span>
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const a = document.createElement('a')
                      a.href = qr
                      a.download = `${editor.title.replace(/\s+/g, '-').toLowerCase()}-qr.png`
                      a.click()
                      toast.success('QR code downloaded')
                    }}
                  >
                    <QrCode className="h-4 w-4" /> Download QR
                  </Button>
                  <Button variant="outline" onClick={onWebShare}>
                    <Globe className="h-4 w-4" /> Share
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid place-items-center rounded-xl border border-dashed border-border/70 px-6 py-10 text-center">
                <QrCode className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium">Publish your card first</p>
                <p className="mt-1 text-xs text-muted-foreground">A QR code pointing to your public link will appear here.</p>
                <Button className="mt-4" onClick={() => onPublishToggle(true)} disabled={running}>
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />} Publish now
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {editor.cardId ? 'Saved to your dashboard' : 'Not saved yet'} · {editor.dirty ? 'unsaved changes' : 'all changes saved'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await run(async () => {
                try {
                  await persist()
                  toast.success('Card saved')
                } catch (err) {
                  toast.error((err as Error).message)
                }
              })
            }}
          >
            <Download className="h-3.5 w-3.5" /> Save now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ExportButton({
  icon: Icon, label, hint, running, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hint: string
  running: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={running}
      className="group flex flex-col items-center gap-1 rounded-xl border border-border/70 bg-card px-3 py-4 transition-all hover:-translate-y-0.5 hover:border-violet-400/60 hover:shadow-md disabled:opacity-60"
    >
      {running ? (
        <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
      ) : (
        <Icon className="h-5 w-5 text-violet-600 transition-transform group-hover:scale-110" />
      )}
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[10px] text-muted-foreground">{hint}</span>
    </button>
  )
}
