'use client'

import * as React from 'react'
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDownToLine, ArrowUpToLine, Bold, Copy, FlipHorizontal2,
  ImagePlus, Italic, Lock, LockOpen, Redo2, RotateCcw, Sparkles, Trash2, Underline, Upload,
} from 'lucide-react'
import { FONT_FAMILIES, type ImageElement, type IconElement, type QRElement, type ShapeElement, type StickerElement, type TextElement } from '@/lib/design/types'
import { PICKER_ICONS } from '@/lib/design/assets'
import { normalizeUpload } from '@/lib/design/export'
import { fontStack, getIcon } from '@/lib/design/renderer'
import { useEditor, selectedElement } from '@/lib/stores/editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ColorInput, ControlGroup, NumberField, Segmented, SliderRow } from './editor-controls'
import { cn } from '@/lib/utils'

export function RightPanel() {
  const sel = useEditor(selectedElement)
  const design = useEditor((s) => s.design)
  const activeSide = useEditor((s) => s.activeSide)

  if (!sel) {
    return (
      <div className="slim-scroll h-full overflow-y-auto">
        <CardSettings />
      </div>
    )
  }

  return (
    <div className="slim-scroll h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {sel.type === 'text' ? 'Text' : sel.type} selected
        </p>
        <QuickActions id={sel.id} locked={sel.locked} />
      </div>

      {sel.type === 'text' && <TextControls el={sel as TextElement} />}
      {sel.type === 'image' && <ImageControls el={sel as ImageElement} />}
      {sel.type === 'shape' && <ShapeControls el={sel as ShapeElement} />}
      {sel.type === 'icon' && <IconControls el={sel as IconElement} />}
      {sel.type === 'qr' && <QrControls el={sel as QRElement} />}
      {sel.type === 'sticker' && <StickerControls el={sel as StickerElement} />}

      <ControlGroup title="Transform & layer">
        <div className="grid grid-cols-2 gap-2.5">
          <NumberField label="X" value={sel.x} onChange={(x) => useEditor.getState().updateElement(sel.id, { x })} />
          <NumberField label="Y" value={sel.y} onChange={(y) => useEditor.getState().updateElement(sel.id, { y })} />
          <NumberField label="Width" value={sel.w} onChange={(w) => useEditor.getState().updateElement(sel.id, { w: Math.max(12, w) })} />
          <NumberField label="Height" value={sel.h} onChange={(h) => useEditor.getState().updateElement(sel.id, { h: Math.max(4, h) })} />
        </div>
        <SliderRow
          label="Rotation"
          min={-180}
          max={180}
          value={sel.rotation}
          format={(v) => `${v}°`}
          onCommitStart={() => useEditor.getState().startContinuous()}
          onChange={(rotation) => useEditor.getState().updateElement(sel.id, { rotation })}
        />
        <SliderRow
          label="Opacity"
          min={0.05}
          max={1}
          step={0.05}
          value={sel.opacity}
          format={(v) => `${Math.round(v * 100)}%`}
          onCommitStart={() => useEditor.getState().startContinuous()}
          onChange={(opacity) => useEditor.getState().updateElement(sel.id, { opacity })}
        />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => useEditor.getState().reorderElement(sel.id, 'front')}>
            <ArrowUpToLine className="h-3.5 w-3.5" /> To front
          </Button>
          <Button variant="outline" size="sm" onClick={() => useEditor.getState().reorderElement(sel.id, 'back')}>
            <ArrowDownToLine className="h-3.5 w-3.5" /> To back
          </Button>
        </div>
      </ControlGroup>

      {sel.role && (
        <ControlGroup title="Smart field">
          <p className="text-xs text-muted-foreground">
            This text is bound to the structured field <span className="font-medium text-foreground">“{sel.role}”</span>.
            Edit it in the Details tab or double-click on canvas.
          </p>
        </ControlGroup>
      )}

      <div className="px-4 py-3">
        <p className="text-[11px] text-muted-foreground">
          {design.width} × {design.height} px canvas · {activeSide} side
        </p>
      </div>
    </div>
  )
}

function QuickActions({ id, locked }: { id: string; locked: boolean }) {
  return (
    <div className="flex gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title={locked ? 'Unlock' : 'Lock'}
        onClick={() => useEditor.getState().updateElement(id, { locked: !locked })}
      >
        {locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="Duplicate"
        onClick={() => useEditor.getState().duplicateElement(id)}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
        title="Delete"
        onClick={() => useEditor.getState().removeElement(id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

/* -------------------------------- text ------------------------------- */

function TextControls({ el }: { el: TextElement }) {
  const update = (patch: Partial<TextElement>) => {
    useEditor.getState().updateElement(el.id, patch)
    if (patch.text !== undefined && el.role) {
      useEditor.getState().syncRoleText(el.role, patch.text)
    }
  }
  const startContinuous = () => useEditor.getState().startContinuous()

  return (
    <>
      <ControlGroup title="Content">
        <Textarea
          value={el.text}
          onChange={(e) => update({ text: e.target.value })}
          onFocus={startContinuous}
          onBlur={() => useEditor.getState().endContinuous()}
          rows={3}
          className="resize-none text-sm"
          placeholder="Type your text…"
        />
      </ControlGroup>

      <ControlGroup title="Font">
        <Select value={el.fontFamily} onValueChange={(fontFamily) => update({ fontFamily })}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f} value={f}>
                <span style={{ fontFamily: fontStack(f) }}>{f}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Size" value={el.fontSize} min={8} max={400} onChange={(fontSize) => update({ fontSize })} />
          <div>
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">Weight</span>
            <Select
              value={String(el.fontWeight)}
              onValueChange={(v) => update({ fontWeight: Number(v) })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[300, 400, 500, 600, 700, 800].map((w) => (
                  <SelectItem key={w} value={String(w)}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ColorInput label="Text color" value={el.color} onChange={(color) => update({ color })} />
        <div className="flex gap-1.5">
          <Button
            variant={el.italic ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ italic: !el.italic })}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={el.uppercase ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ uppercase: !el.uppercase })}
            title="Uppercase"
          >
            <span className="text-[11px] font-bold">AA</span>
          </Button>
          <div className="flex-1">
            <Segmented
              options={[
                { value: 'left', label: <AlignLeft className="h-3.5 w-3.5" />, title: 'Align left' },
                { value: 'center', label: <AlignCenter className="h-3.5 w-3.5" />, title: 'Align center' },
                { value: 'right', label: <AlignRight className="h-3.5 w-3.5" />, title: 'Align right' },
              ]}
              value={el.align}
              onChange={(align) => update({ align: align as TextElement['align'] })}
            />
          </div>
        </div>
        <SliderRow label="Letter spacing" min={-4} max={24} step={0.5} value={el.letterSpacing} onCommitStart={startContinuous} onChange={(letterSpacing) => update({ letterSpacing })} />
        <SliderRow label="Line height" min={0.8} max={2.4} step={0.05} value={el.lineHeight} format={(v) => v.toFixed(2)} onCommitStart={startContinuous} onChange={(lineHeight) => update({ lineHeight })} />
        <div className="flex gap-1.5">
          <Button
            variant={el.fontWeight >= 600 ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            title="Toggle bold"
            onClick={() => update({ fontWeight: el.fontWeight >= 600 ? 400 : 700 })}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={el.underline ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            title="Underline"
            onClick={() => update({ underline: !el.underline })}
          >
            <Underline className="h-3.5 w-3.5" />
          </Button>
        </div>
      </ControlGroup>
    </>
  )
}

/* -------------------------------- image ------------------------------ */

function ImageControls({ el }: { el: ImageElement }) {
  const update = (patch: Partial<ImageElement>) => useEditor.getState().updateElement(el.id, patch)
  const fileRef = React.useRef<HTMLInputElement>(null)
  return (
    <>
      <ControlGroup title="Image">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) update({ src: await normalizeUpload(file) })
            e.target.value = ''
          }}
        />
        <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Replace image
        </Button>
        <Segmented
          options={[
            { value: 'cover', label: 'Fill' },
            { value: 'contain', label: 'Fit' },
          ]}
          value={el.fit}
          onChange={(fit) => update({ fit: fit as ImageElement['fit'] })}
        />
        <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          Circular crop
          <SwitchEl checked={el.circle} onChange={(circle) => update({ circle })} />
        </label>
        <SliderRow label="Corner radius" min={0} max={120} value={el.radius} onCommitStart={() => useEditor.getState().startContinuous()} onChange={(radius) => update({ radius })} />
      </ControlGroup>
      <ControlGroup title="Border">
        <SliderRow label="Width" min={0} max={24} value={el.borderWidth} onCommitStart={() => useEditor.getState().startContinuous()} onChange={(borderWidth) => update({ borderWidth })} />
        <ColorInput label="Border color" value={el.borderColor} onChange={(borderColor) => update({ borderColor })} />
      </ControlGroup>
    </>
  )
}

function SwitchEl({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-secondary border border-border',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
          checked ? 'left-[18px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

/* -------------------------------- shape ------------------------------ */

function ShapeControls({ el }: { el: ShapeElement }) {
  const update = (patch: Partial<ShapeElement>) => useEditor.getState().updateElement(el.id, patch)
  return (
    <>
      <ControlGroup title="Shape">
        <Segmented
          options={[
            { value: 'rect', label: 'Rect' },
            { value: 'ellipse', label: 'Circle' },
            { value: 'line', label: 'Line' },
          ]}
          value={el.shape}
          onChange={(shape) => update({ shape: shape as ShapeElement['shape'] })}
        />
        {el.shape !== 'line' && <ColorInput label="Fill" value={el.fill === 'none' ? '#000000' : el.fill} onChange={(fill) => update({ fill })} />}
        {el.shape !== 'line' && (
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            No fill (outline only)
            <SwitchEl checked={el.fill === 'none'} onChange={(v) => update({ fill: v ? 'none' : '#7c3aed' })} />
          </label>
        )}
        {el.shape === 'rect' && (
          <SliderRow label="Corner radius" min={0} max={120} value={el.radius} onCommitStart={() => useEditor.getState().startContinuous()} onChange={(radius) => update({ radius })} />
        )}
      </ControlGroup>
      <ControlGroup title="Stroke">
        {el.shape !== 'line' && (
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            Show stroke
            <SwitchEl checked={el.strokeWidth > 0} onChange={(v) => update({ strokeWidth: v ? Math.max(2, el.strokeWidth || 3) : 0, stroke: el.stroke === 'none' ? '#1e293b' : el.stroke })} />
          </label>
        )}
        <ColorInput label="Stroke color" value={el.stroke === 'none' ? '#000000' : el.stroke} onChange={(stroke) => update({ stroke })} />
        <SliderRow label="Thickness" min={1} max={40} value={el.strokeWidth} onCommitStart={() => useEditor.getState().startContinuous()} onChange={(strokeWidth) => update({ strokeWidth })} />
      </ControlGroup>
    </>
  )
}

/* --------------------------------- icon ------------------------------ */

function IconControls({ el }: { el: IconElement }) {
  const update = (patch: Partial<IconElement>) => useEditor.getState().updateElement(el.id, patch)
  return (
    <ControlGroup title="Icon">
      <div className="slim-scroll grid max-h-52 grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-border/60 p-2">
        {PICKER_ICONS.map((ic) => {
          const Icon = getIcon(ic.name)
          return (
            <button
              key={ic.name}
              onClick={() => update({ icon: ic.name })}
              className={cn(
                'grid h-8 place-items-center rounded-md transition-colors',
                el.icon === ic.name ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
            </button>
          )
        })}
      </div>
      <ColorInput label="Icon color" value={el.color} onChange={(color) => update({ color })} />
      <SliderRow label="Stroke width" min={0.5} max={3.5} step={0.25} value={el.strokeWidth} onCommitStart={() => useEditor.getState().startContinuous()} onChange={(strokeWidth) => update({ strokeWidth })} />
    </ControlGroup>
  )
}

/* ---------------------------------- QR ------------------------------- */

function QrControls({ el }: { el: QRElement }) {
  const update = (patch: Partial<QRElement>) => useEditor.getState().updateElement(el.id, patch)
  const business = useEditor((s) => s.business)
  return (
    <ControlGroup title="QR code">
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">Content</span>
        <Textarea value={el.data} onChange={(e) => update({ data: e.target.value })} rows={3} className="resize-none text-xs" />
      </div>
      <ColorInput label="Code color" value={el.fg} onChange={(fg) => update({ fg })} />
      <ColorInput label="Background" value={el.bg} onChange={(bg) => update({ bg })} />
      {business && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            update({
              data: [
                `BEGIN:VCARD`, `VERSION:3.0`, `FN:${business.fullName}`, `ORG:${business.company}`,
                `TITLE:${business.jobTitle}`, `TEL:${business.phone}`, `EMAIL:${business.email}`,
                `URL:${business.website}`, `END:VCARD`,
              ].join('\n'),
            })
          }
        >
          <Sparkles className="h-4 w-4" /> Use my contact details
        </Button>
      )}
    </ControlGroup>
  )
}

/* ------------------------------- sticker ----------------------------- */

function StickerControls({ el }: { el: StickerElement }) {
  const update = (patch: Partial<StickerElement>) => useEditor.getState().updateElement(el.id, patch)
  return (
    <ControlGroup title="Sticker">
      <div className="slim-scroll grid max-h-44 grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-border/60 p-2">
        {['🎉', '🥳', '🎈', '🎊', '🎁', '🎂', '💍', '💐', '🌹', '🌙', '⭐', '🕌', '✨', '🌟', '💫', '😊', '🥰', '😍', '🤩', '😂', '🌸', '🌼', '🌻', '🍃', '🌈', '☀️', '🍰', '🧁', '🏆', '🎓', '🪩', '🤍'].map((e, i) => (
          <button
            key={`${e}-${i}`}
            onClick={() => update({ emoji: e })}
            className={cn(
              'grid h-9 place-items-center rounded-md text-xl transition-colors',
              el.emoji === e ? 'bg-violet-600/15 ring-1 ring-violet-500' : 'hover:bg-accent',
            )}
          >
            {e}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">Resize with the handles or the Width/Height fields below.</p>
    </ControlGroup>
  )
}

/* ---------------------------- card settings -------------------------- */

function CardSettings() {
  const design = useEditor((s) => s.design)
  const title = useEditor((s) => s.title)
  const category = useEditor((s) => s.category)
  const toggleBack = useEditor((s) => s.toggleBack)
  const hasBack = Boolean(design.back)
  void Redo2
  void RotateCcw
  void FlipHorizontal2
  void ImagePlus
  return (
    <div>
      <div className="border-b border-border/60 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card settings</p>
        <p className="mt-2 truncate text-sm font-semibold">{title}</p>
        <p className="text-xs capitalize text-muted-foreground">
          {category} · {design.width} × {design.height} px
        </p>
      </div>
      <ControlGroup title="Sides">
        <label className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          Two-sided design {hasBack ? '(front & back)' : ''}
          <SwitchEl checked={hasBack} onChange={(v) => toggleBack(v)} />
        </label>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {hasBack
            ? 'Use the Front / Back switch in the toolbar to flip sides.'
            : 'Enable to design a back side — great for business cards.'}
        </p>
      </ControlGroup>
      <ControlGroup title="Quick start">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Pick something from the left panel — templates, text, images, backgrounds, shapes, icons, stickers or a QR
          code. Click any element on the canvas to edit it, and double-click text to type directly.
        </p>
      </ControlGroup>
      <ControlGroup title="Zoom">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Use the toolbar to zoom, fit to screen, undo and redo. Keyboard: ⌘Z / ⌘⇧Z, arrows to nudge, ⌫ to delete,
          ⌘D to duplicate.
        </p>
      </ControlGroup>
    </div>
  )
}
