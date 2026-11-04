'use client'

import * as React from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function ColorInput({
  value, onChange, label, className,
}: {
  value: string
  onChange: (v: string) => void
  label?: string
  className?: string
}) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'
  return (
    <label className={cn('flex items-center gap-2', className)}>
      <input
        type="color"
        value={safe}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded-md border border-border/70 bg-none p-0.5"
        aria-label={label ?? 'Color'}
      />
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{label ?? value}</span>
    </label>
  )
}

export function SliderRow({
  label, value, min, max, step = 1, onChange, onCommitStart, format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  onCommitStart?: () => void
  format?: (v: number) => string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs tabular-nums text-foreground">{format ? format(value) : value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onPointerDown={onCommitStart}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  )
}

export function NumberField({
  label, value, onChange, step = 1, min, max, suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
}) {
  const [text, setText] = React.useState(String(Math.round(value)))
  React.useEffect(() => setText(String(Math.round(value))), [value])
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
        {label}
        {suffix ? ` (${suffix})` : ''}
      </span>
      <Input
        type="number"
        value={text}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          setText(e.target.value)
          const v = Number(e.target.value)
          if (!Number.isNaN(v)) onChange(v)
        }}
        className="h-8 text-xs"
      />
    </label>
  )
}

export function Segmented<T extends string>({
  options, value, onChange, className,
}: {
  options: { value: T; label: React.ReactNode; title?: string }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={cn('flex rounded-lg border border-border/70 bg-secondary/50 p-0.5', className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          title={o.title}
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
            value === o.value
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 px-4 py-4 last:border-b-0">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-3.5">{children}</div>
    </div>
  )
}

export function ActionButton({
  icon: Icon, label, onClick, active, danger,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        danger && 'text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400',
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}
