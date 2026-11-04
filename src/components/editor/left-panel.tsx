'use client'

import * as React from 'react'
import {
  ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, Copy, Eye, EyeOff, ImagePlus,
  Layers, Link2, Lock, LockOpen, Search, Shapes, Smile, Star, Trash2, Type, Upload, QrCode,
  Palette, LayoutTemplate, ClipboardList,
} from 'lucide-react'
import { ScaledCard, getIcon } from '@/lib/design/renderer'
import { TEMPLATES } from '@/lib/design/templates'
import { GRADIENT_PRESETS, PICKER_ICONS, SOLID_PRESETS, STICKER_SETS, TEXT_PRESETS } from '@/lib/design/assets'
import { newEllipse, newIcon, newImage, newLine, newQr, newShape, newSticker, newText } from '@/lib/design/factory'
import { normalizeUpload } from '@/lib/design/export'
import { CARD_SIZES, type Background, type PatternKind } from '@/lib/design/types'
import { useEditor } from '@/lib/stores/editor-store'
import { useApp } from '@/lib/stores/app-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { centeredPlacement } from './canvas'
import { ActionButton, ColorInput, Segmented } from './editor-controls'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'images', label: 'Images', icon: ImagePlus },
  { id: 'background', label: 'Background', icon: Palette },
  { id: 'shapes', label: 'Shapes', icon: Shapes },
  { id: 'icons', label: 'Icons', icon: Star },
  { id: 'stickers', label: 'Stickers', icon: Smile },
  { id: 'qr', label: 'QR code', icon: QrCode },
  { id: 'fields', label: 'Details', icon: ClipboardList },
  { id: 'layers', label: 'Layers', icon: Layers },
] as const

type TabId = (typeof TABS)[number]['id']

export function LeftPanel({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  return (
    <div className="flex h-full">
      {/* icon rail */}
      <nav className="flex w-16 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-border/60 bg-card py-3 slim-scroll" aria-label="Editor panels">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            title={t.label}
            aria-label={t.label}
            aria-selected={tab === t.id}
            role="tab"
            className={cn(
              'flex w-14 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors',
              tab === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <t.icon className="h-[18px] w-[18px]" />
            {t.label}
          </button>
        ))}
      </nav>

      {/* panel content */}
      <div className="slim-scroll w-60 shrink-0 overflow-y-auto border-r border-border/60 bg-background">
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'text' && <TextTab />}
        {tab === 'images' && <ImagesTab />}
        {tab === 'background' && <BackgroundTab />}
        {tab === 'shapes' && <ShapesTab />}
        {tab === 'icons' && <IconsTab />}
        {tab === 'stickers' && <StickersTab />}
        {tab === 'qr' && <QrTab />}
        {tab === 'fields' && <FieldsTab />}
        {tab === 'layers' && <LayersTab />}
      </div>
    </div>
  )
}

/* ------------------------------ templates ---------------------------- */

function TemplatesTab() {
  const applyTemplate = useEditor((s) => s.applyTemplate)
  const [query, setQuery] = React.useState('')
  const filtered = TEMPLATES.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="p-3">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Apply a template</p>
      <p className="mb-3 text-[11px] text-muted-foreground">Replaces the current design — undo is available.</p>
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-8 rounded-lg pl-8 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => applyTemplate(tpl)}
            className="group overflow-hidden rounded-lg border border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-md"
            title={`Apply “${tpl.name}”`}
          >
            <ScaledCard design={tpl.design} maxWidth={110} maxHeight={120} radius={0} shadow={false} />
            <p className="truncate px-1.5 py-1 text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
              {tpl.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------- text ------------------------------- */

function TextTab() {
  const design = useEditor((s) => s.design)
  const addElement = useEditor((s) => s.addElement)
  const add = (opts: Parameters<typeof newText>[0]) => {
    const { x, y } = centeredPlacement(design, opts.w ?? 420, opts.h ?? 60)
    addElement(newText({ x, y, ...opts }))
  }
  return (
    <div className="space-y-4 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Add text</p>
      {TEXT_PRESETS.map((p) => (
        <button
          key={p.name}
          onClick={() =>
            add(
              {
                text: p.name === 'Heading' ? 'Your Heading' : p.name === 'Elegant Script' ? 'With love' : p.name === 'Body' ? 'A little message goes here. Edit me!' : 'Your text here',
                ...p.style,
                w: p.style.fontSize! > 70 ? 560 : 420,
                h: Math.ceil((p.style.fontSize ?? 32) * 1.6),
              } as Parameters<typeof newText>[0],
            )
          }
          className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-violet-400/60 hover:shadow-md"
        >
          <span className="block" style={{ ...p.preview }}>
            {p.name}
          </span>
          <span className="mt-1 block text-[10px] text-muted-foreground">
            {p.style.fontFamily} · {p.style.fontSize}px
          </span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------- images ------------------------------ */

function ImagesTab() {
  const design = useEditor((s) => s.design)
  const addElement = useEditor((s) => s.addElement)
  const updateElement = useEditor((s) => s.updateElement)
  const selectedId = useEditor((s) => s.selectedId)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const side = design.front

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    for (const file of Array.from(files).slice(0, 4)) {
      if (!file.type.startsWith('image/')) continue
      try {
        const src = await normalizeUpload(file)
        const w = Math.min(480, design.width * 0.5)
        const { x, y } = centeredPlacement(design, w, w * 0.75)
        addElement(newImage({ src, x, y, w, h: Math.round(w * 0.75) }))
      } catch {
        // skip invalid files
      }
    }
  }

  const images = side.elements.filter((el) => el.type === 'image')

  return (
    <div className="space-y-4 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Upload images</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
        <Upload className="h-4 w-4" /> Upload photo or logo
      </Button>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Photos are embedded in the design. PNG with transparency works great for logos.
      </p>

      {images.length > 0 && (
        <>
          <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">In this design</p>
          <div className="grid grid-cols-2 gap-2">
            {images.map((el) => (
              <div key={el.id} className="group relative overflow-hidden rounded-lg border border-border/70">
                <img src={(el as { src: string }).src} alt="Design image" className="h-20 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => {
                      if (selectedId && selectedId !== el.id) {
                        updateElement(selectedId, { src: (el as { src: string }).src } as never)
                      }
                    }}
                    title="Apply to selected image element"
                  >
                    <Link2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => {
                      const w = 320
                      const { x, y } = centeredPlacement(design, w, 240)
                      addElement(newImage({ src: (el as { src: string }).src, x, y, w, h: 240 }))
                    }}
                    title="Add a copy to the canvas"
                  >
                    <ImagePlus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ----------------------------- background ---------------------------- */

function BackgroundTab() {
  const design = useEditor((s) => s.design)
  const activeSide = useEditor((s) => s.activeSide)
  const setBackground = useEditor((s) => s.setBackground)
  const bg = (activeSide === 'back' && design.back ? design.back : design.front).background
  const fileRef = React.useRef<HTMLInputElement>(null)

  const patch = (p: Partial<Background>) => setBackground(p)

  return (
    <div className="space-y-5 p-3">
      <Segmented
        options={[
          { value: 'solid', label: 'Solid' },
          { value: 'gradient', label: 'Gradient' },
          { value: 'pattern', label: 'Pattern' },
          { value: 'image', label: 'Image' },
        ]}
        value={bg.type}
        onChange={(v) => patch({ type: v as Background['type'] })}
      />

      {bg.type === 'solid' && (
        <>
          <Swatches colors={SOLID_PRESETS} value={bg.color} onPick={(color) => patch({ color })} />
          <ColorInput label="Custom color" value={bg.color} onChange={(color) => patch({ color })} />
        </>
      )}

      {bg.type === 'gradient' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_PRESETS.map((g) => (
              <button
                key={g.name}
                onClick={() => patch({ gradient: { from: g.from, to: g.to, angle: g.angle } })}
                title={g.name}
                className={cn(
                  'h-12 rounded-lg border transition-transform hover:scale-105',
                  bg.gradient.from === g.from && bg.gradient.to === g.to ? 'border-violet-500 ring-2 ring-violet-500/40' : 'border-border/70',
                )}
                style={{ background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ColorInput label="From" value={bg.gradient.from} onChange={(from) => patch({ gradient: { ...bg.gradient, from } })} />
            <ColorInput label="To" value={bg.gradient.to} onChange={(to) => patch({ gradient: { ...bg.gradient, to } })} />
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Angle</span>
              <span className="tabular-nums">{bg.gradient.angle}°</span>
            </div>
            <Slider
              value={[bg.gradient.angle]}
              min={0}
              max={360}
              onValueChange={([angle]) => patch({ gradient: { ...bg.gradient, angle } })}
            />
          </div>
        </>
      )}

      {bg.type === 'pattern' && (
        <>
          <Swatches colors={SOLID_PRESETS} value={bg.color} onPick={(color) => patch({ color })} />
          <ColorInput label="Base color" value={bg.color} onChange={(color) => patch({ color })} />
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Pattern style</p>
            <div className="grid grid-cols-3 gap-2">
              {(['dots', 'grid', 'stripes', 'diagonal', 'rings', 'confetti'] as PatternKind[]).map((p) => (
                <button
                  key={p}
                  onClick={() => patch({ pattern: p })}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-[11px] font-medium capitalize transition-colors',
                    bg.pattern === p ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-300' : 'border-border/70 text-muted-foreground hover:bg-accent',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ColorInput label="Pattern color" value={bg.patternColor} onChange={(patternColor) => patch({ patternColor })} />
        </>
      )}

      {bg.type === 'image' && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) {
                const imageUrl = await normalizeUpload(file, 1600)
                patch({ imageUrl })
              }
              e.target.value = ''
            }}
          />
          <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload background
          </Button>
          {bg.imageUrl && (
            <div className="overflow-hidden rounded-lg border border-border/70">
              <img src={bg.imageUrl} alt="Background" className="h-24 w-full object-cover" />
            </div>
          )}
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Dark overlay</span>
              <span className="tabular-nums">{Math.round(bg.overlay * 100)}%</span>
            </div>
            <Slider value={[bg.overlay]} min={0} max={0.9} step={0.05} onValueChange={([overlay]) => patch({ overlay })} />
          </div>
        </>
      )}
    </div>
  )
}

function Swatches({ colors, value, onPick }: { colors: string[]; value: string; onPick: (c: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          title={c}
          className={cn(
            'h-6 w-full rounded-md border transition-transform hover:scale-110',
            value.toLowerCase() === c ? 'border-violet-500 ring-2 ring-violet-500/40' : 'border-border/60',
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  )
}

/* ------------------------------- shapes ------------------------------ */

function ShapesTab() {
  const design = useEditor((s) => s.design)
  const addElement = useEditor((s) => s.addElement)
  const place = (w: number, h: number) => centeredPlacement(design, w, h)

  const shapes: { label: string; make: () => void }[] = [
    { label: 'Rectangle', make: () => { const { x, y } = place(360, 220); addElement(newShape({ x, y, w: 360, h: 220, fill: '#7c3aed' })) } },
    { label: 'Rounded pill', make: () => { const { x, y } = place(320, 72); addElement(newShape({ x, y, w: 320, h: 72, fill: '#0f172a', radius: 36 })) } },
    { label: 'Circle', make: () => { const { x, y } = place(200, 200); addElement(newEllipse({ x, y, w: 200, h: 200, fill: 'none', stroke: '#7c3aed', strokeWidth: 6 })) } },
    { label: 'Filled circle', make: () => { const { x, y } = place(180, 180); addElement(newEllipse({ x, y, w: 180, h: 180, fill: '#f59e0b', stroke: 'none', strokeWidth: 0 })) } },
    { label: 'Divider line', make: () => { const { x, y } = place(320, 8); addElement(newLine({ x, y, w: 320, stroke: '#0f172a', strokeWidth: 3 })) } },
    { label: 'Gold diamond', make: () => { const { x, y } = place(56, 56); addElement(newShape({ x, y, w: 56, h: 56, fill: '#d4a853', radius: 4, rotation: 45 })) } },
  ]

  return (
    <div className="space-y-2 p-3">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Add shapes</p>
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((s) => (
          <button
            key={s.label}
            onClick={s.make}
            className="rounded-xl border border-border/70 bg-card px-3 py-4 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-violet-400/60 hover:text-foreground hover:shadow-md"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------- icons ------------------------------ */

function IconsTab() {
  const design = useEditor((s) => s.design)
  const addElement = useEditor((s) => s.addElement)
  const groups = React.useMemo(() => {
    const map = new Map<string, string[]>()
    for (const ic of PICKER_ICONS) {
      if (!map.has(ic.group)) map.set(ic.group, [])
      map.get(ic.group)!.push(ic.name)
    }
    return Array.from(map.entries())
  }, [])
  return (
    <div className="space-y-4 p-3">
      {groups.map(([group, icons]) => (
        <div key={group}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
          <div className="grid grid-cols-5 gap-1.5">
            {icons.map((name) => (
              <button
                key={name}
                title={name}
                onClick={() => {
                  const size = 90
                  const { x, y } = centeredPlacement(design, size, size)
                  addElement(newIcon({ icon: name, x, y, w: size, h: size, color: '#334155' }))
                }}
                className="grid h-10 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-all hover:border-violet-400/60 hover:bg-accent hover:text-foreground"
              >
                <IconGlyph name={name} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function IconGlyph({ name, className }: { name: string; className?: string }) {
  const Icon = getIcon(name)
  if (!Icon) return <Star className={className} />
  return (
    // eslint-disable-next-line react-hooks/static-components -- stable icon registry lookup
    <Icon className={className} />
  )
}

/* ------------------------------ stickers ----------------------------- */

function StickersTab() {
  const design = useEditor((s) => s.design)
  const addElement = useEditor((s) => s.addElement)
  return (
    <div className="space-y-4 p-3">
      {STICKER_SETS.map((set) => (
        <div key={set.name}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{set.name}</p>
          <div className="grid grid-cols-5 gap-1.5">
            {set.emojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => {
                  const size = 110
                  const { x, y } = centeredPlacement(design, size, size)
                  addElement(newSticker({ emoji, x, y, w: size, h: size }))
                }}
                className="grid h-11 place-items-center rounded-lg text-2xl transition-transform hover:scale-110 hover:bg-accent"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* --------------------------------- QR -------------------------------- */

function QrTab() {
  const design = useEditor((s) => s.design)
  const addElement = useEditor((s) => s.addElement)
  const business = useEditor((s) => s.business)
  const [data, setData] = React.useState('https://cardly.app/hello')
  return (
    <div className="space-y-3.5 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Add a QR code</p>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Content (URL, text or WiFi)</Label>
        <Input value={data} onChange={(e) => setData(e.target.value)} className="h-9 text-xs" placeholder="https://…" />
      </div>
      <Button
        className="w-full"
        onClick={() => {
          const size = 170
          const { x, y } = centeredPlacement(design, size, size)
          addElement(newQr({ data: data || 'https://cardly.app', x, y, w: size, h: size }))
        }}
      >
        <QrCode className="h-4 w-4" /> Add QR to canvas
      </Button>
      {business && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const size = 170
            const { x, y } = centeredPlacement(design, size, size)
            const vcard = [
              `BEGIN:VCARD`, `VERSION:3.0`, `FN:${business.fullName}`, `ORG:${business.company}`,
              `TITLE:${business.jobTitle}`, `TEL:${business.phone}`, `EMAIL:${business.email}`,
              `URL:${business.website}`, `END:VCARD`,
            ].join('\n')
            addElement(newQr({ data: vcard, x, y, w: size, h: size }))
          }}
        >
          Add contact (vCard) QR
        </Button>
      )}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Select a QR on the canvas to change its colors or content.
      </p>
    </div>
  )
}

/* -------------------------- structured fields ------------------------ */

function FieldsTab() {
  const category = useEditor((s) => s.category)
  const business = useEditor((s) => s.business)
  const invitation = useEditor((s) => s.invitation)
  const setBusiness = useEditor((s) => s.setBusiness)
  const setInvitation = useEditor((s) => s.setInvitation)
  const { openAuth } = useApp()
  void openAuth

  if (category === 'business' || (business && Object.keys(business).length > 0)) {
    const b = business ?? {
      fullName: 'Your Name', jobTitle: 'Job Title', company: 'Company', phone: '', email: '',
      website: '', address: '', whatsapp: '', socials: {},
    }
    return (
      <div className="space-y-3.5 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Business details</p>
        <p className="text-[11px] text-muted-foreground">Bound text elements on the card update automatically.</p>
        {([
          ['fullName', 'Full name'], ['jobTitle', 'Job title'], ['company', 'Company'],
          ['phone', 'Phone'], ['whatsapp', 'WhatsApp'], ['email', 'Email'],
          ['website', 'Website'], ['address', 'Office address'],
        ] as const).map(([key, label]) => (
          <FieldRow
            key={key}
            label={label}
            value={b[key] ?? ''}
            onChange={(v) => setBusiness({ [key]: v } as never)}
          />
        ))}
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Socials</p>
        {(['linkedin', 'instagram', 'twitter'] as const).map((key) => (
          <FieldRow
            key={key}
            label={key}
            value={b.socials?.[key] ?? ''}
            onChange={(v) => setBusiness({ socials: { ...b.socials, [key]: v } })}
          />
        ))}
      </div>
    )
  }

  const inv = invitation ?? {
    eventTitle: 'You are invited', hostName: 'Host name', dateTime: 'Date & time',
    venue: 'Venue', mapsUrl: '', rsvp: 'RSVP contact', dressCode: 'Dress code', extraInfo: '',
  }
  return (
    <div className="space-y-3.5 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Event details</p>
      <p className="text-[11px] text-muted-foreground">These structured fields sync with bound text on the card.</p>
      {([
        ['eventTitle', 'Event title'], ['hostName', 'Host name'], ['dateTime', 'Date & time'],
        ['venue', 'Venue'], ['mapsUrl', 'Google Maps link'], ['rsvp', 'RSVP contact'],
        ['dressCode', 'Dress code'], ['extraInfo', 'Additional info'],
      ] as const).map(([key, label]) => (
        <FieldRow key={key} label={label} value={inv[key]} onChange={(v) => setInvitation({ [key]: v } as never)} />
      ))}
    </div>
  )
}

function FieldRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium capitalize text-muted-foreground">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-xs" />
    </label>
  )
}

/* -------------------------------- layers ----------------------------- */

function LayersTab() {
  const design = useEditor((s) => s.design)
  const activeSide = useEditor((s) => s.activeSide)
  const selectedId = useEditor((s) => s.selectedId)
  const select = useEditor((s) => s.select)
  const updateElement = useEditor((s) => s.updateElement)
  const removeElement = useEditor((s) => s.removeElement)
  const duplicateElement = useEditor((s) => s.duplicateElement)
  const reorderElement = useEditor((s) => s.reorderElement)
  const side = activeSide === 'back' && design.back ? design.back : design.front
  const ordered = [...side.elements].reverse()

  const iconFor = (t: string) => (t === 'text' ? Type : t === 'image' ? ImagePlus : t === 'icon' ? Star : t === 'qr' ? QrCode : t === 'sticker' ? Smile : Shapes)

  return (
    <div className="p-3">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Layers · {side.elements.length}
      </p>
      {ordered.length === 0 && <p className="text-xs text-muted-foreground">Nothing on this side yet.</p>}
      <div className="space-y-1.5">
        {ordered.map((el) => {
          const Icon = iconFor(el.type)
          const active = el.id === selectedId
          return (
            <div
              key={el.id}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors',
                active ? 'border-violet-500/60 bg-violet-500/5' : 'border-border/60 hover:bg-accent',
              )}
            >
              <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => select(el.id)}>
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs">
                  {el.type === 'text' ? (el as { text: string }).text.slice(0, 22) || 'Text' : el.name ?? el.type}
                </span>
              </button>
              <button
                title={el.hidden ? 'Show' : 'Hide'}
                onClick={() => updateElement(el.id, { hidden: !el.hidden })}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {el.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                title={el.locked ? 'Unlock' : 'Lock'}
                onClick={() => updateElement(el.id, { locked: !el.locked })}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {el.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
              </button>
              <div className="flex flex-col">
                <button
                  title="Bring forward"
                  onClick={() => reorderElement(el.id, 'forward')}
                  className="rounded px-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  title="Send backward"
                  onClick={() => reorderElement(el.id, 'backward')}
                  className="rounded px-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <button
                title="Duplicate"
                onClick={() => duplicateElement(el.id)}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                title="Delete"
                onClick={() => removeElement(el.id)}
                className="rounded p-1 text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
      {side.elements.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
          <ActionButton icon={ArrowUpToLine} label="Bring to front" onClick={() => selectedId && reorderElement(selectedId, 'front')} />
          <ActionButton icon={ArrowDownToLine} label="Send to back" onClick={() => selectedId && reorderElement(selectedId, 'back')} />
        </div>
      )}
    </div>
  )
}
