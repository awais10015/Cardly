'use client'

import * as React from 'react'
import QRCodeLib from 'qrcode'
import {
  Heart, HeartHandshake, Sparkles, Star, Cake, Gift, PartyPopper, Gem, Crown, Trophy, Award,
  GraduationCap, CircleDot, Flower2, Leaf, Sun, Moon, MoonStar, CloudSun, Snowflake, Feather,
  Cherry, Bird, Rocket, Flame, Diamond, Music, Camera, Bell, Ticket, Palmtree, Briefcase,
  Building2, Phone, Smartphone, Mail, Globe, MapPin, Clock, CalendarDays, Users, User,
  MessageCircle, Wifi, QrCode, Link as LinkIcon, AtSign, Send, Mic, UtensilsCrossed, Coffee,
  Car, Plane, Instagram, Facebook, Twitter, Linkedin, Github, Youtube, Twitch, Slack,
  type LucideIcon,
} from 'lucide-react'
import type {
  Background, CardDesign, CardElement, CardSide, IconElement, ImageElement, QRElement,
  ShapeElement, StickerElement, TextElement,
} from './types'
import { backgroundCss } from './types'

/* ------------------------------ fonts ------------------------------ */

export const FONT_STACKS: Record<string, string> = {
  Inter: "'Inter', 'Segoe UI', sans-serif",
  'Space Grotesk': "'Space Grotesk', 'Inter', sans-serif",
  'Playfair Display': "'Playfair Display', Georgia, serif",
  'Cormorant Garamond': "'Cormorant Garamond', Georgia, serif",
  'Great Vibes': "'Great Vibes', 'Segoe Script', cursive",
  'Dancing Script': "'Dancing Script', 'Segoe Script', cursive",
  'Bebas Neue': "'Bebas Neue', Impact, sans-serif",
  Caveat: "'Caveat', 'Comic Sans MS', cursive",
}

export function fontStack(family: string): string {
  return FONT_STACKS[family] ?? `'${family}', sans-serif`
}

/* --------------------------- icon registry -------------------------- */

const ICONS: Record<string, LucideIcon> = {
  Heart, HeartHandshake, Sparkles, Star, Cake, Gift, PartyPopper, Gem, Crown, Trophy, Award,
  GraduationCap, CircleDot, Flower2, Leaf, Sun, Moon, MoonStar, CloudSun, Snowflake, Feather,
  Cherry, Bird, Rocket, Flame, Diamond, Music, Camera, Bell, Ticket, Palmtree, Briefcase,
  Building2, Phone, Smartphone, Mail, Globe, MapPin, Clock, CalendarDays, Users, User,
  MessageCircle, Wifi, QrCode, Link: LinkIcon, AtSign, Send, Mic, UtensilsCrossed, Coffee,
  Car, Plane, Instagram, Facebook, Twitter, Linkedin, Github, Youtube, Twitch, Slack,
}

export function getIcon(name: string): LucideIcon | null {
  return ICONS[name] ?? null
}

/* ------------------------------ QR code ----------------------------- */

const qrCache = new Map<string, string>()

export function useQrDataUrl(data: string, fg: string, bg: string, enabled = true): string | null {
  const [url, setUrl] = React.useState<string | null>(() => qrCache.get(`${data}|${fg}|${bg}`) ?? null)
  React.useEffect(() => {
    if (!enabled || !data) return
    const key = `${data}|${fg}|${bg}`
    const cached = qrCache.get(key)
    if (cached) {
      setUrl(cached)
      return
    }
    let alive = true
    QRCodeLib.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 512,
      color: { dark: fg, light: bg === 'transparent' ? '#00000000' : bg },
    })
      .then((u) => {
        qrCache.set(key, u)
        if (alive) setUrl(u)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [data, fg, bg, enabled])
  return url
}

export async function qrDataUrl(data: string, fg = '#000000', bg = '#ffffff'): Promise<string> {
  const key = `${data}|${fg}|${bg}`
  const cached = qrCache.get(key)
  if (cached) return cached
  const u = await QRCodeLib.toDataURL(data, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
    color: { dark: fg, light: bg },
  })
  qrCache.set(key, u)
  return u
}

/* --------------------------- pattern layer -------------------------- */

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const PatternLayer = React.memo(function PatternLayer({ bg, w, h }: { bg: Background; w: number; h: number }) {
  const color = bg.patternColor || '#00000022'
  const pid = React.useId().replace(/[:]/g, '')
  const size = 46

  let content: React.ReactNode = null
  switch (bg.pattern) {
    case 'dots':
      content = <circle cx={size / 2} cy={size / 2} r={4.2} fill={color} />
      break
    case 'grid':
      content = (
        <>
          <path d={`M0 0 H${size}`} stroke={color} strokeWidth={1.5} />
          <path d={`M0 0 V${size}`} stroke={color} strokeWidth={1.5} />
        </>
      )
      break
    case 'stripes':
      content = <path d={`M${size * 0.25} 0 V${size}`} stroke={color} strokeWidth={size * 0.16} />
      break
    case 'diagonal':
      content = <path d={`M-4 ${size + 4} L${size + 4} -4`} stroke={color} strokeWidth={7} />
      break
    case 'rings':
      content = (
        <>
          <circle cx={size / 2} cy={size / 2} r={size * 0.42} fill="none" stroke={color} strokeWidth={2} />
          <circle cx={size / 2} cy={size / 2} r={size * 0.18} fill="none" stroke={color} strokeWidth={2} />
        </>
      )
      break
    case 'confetti': {
      const rnd = seeded(42)
      const pieces: React.ReactNode[] = []
      for (let i = 0; i < 7; i++) {
        const x = rnd() * size
        const y = rnd() * size
        const kind = Math.floor(rnd() * 3)
        const s = 3 + rnd() * 4
        if (kind === 0) pieces.push(<circle key={i} cx={x} cy={y} r={s * 0.7} fill={color} />)
        else if (kind === 1)
          pieces.push(
            <rect key={i} x={x} y={y} width={s} height={s} fill={color} transform={`rotate(${rnd() * 90} ${x} ${y})`} />,
          )
        else
          pieces.push(
            <path key={i} d={`M${x} ${y} q ${s} ${-s} ${s * 2} 0`} stroke={color} strokeWidth={2.2} fill="none" />,
          )
      }
      content = <>{pieces}</>
      break
    }
    default:
      return null
  }

  return (
    <svg className="absolute inset-0" width={w} height={h}>
      <defs>
        <pattern id={`pat-${pid}`} width={size} height={size} patternUnits="userSpaceOnUse">
          {content}
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#pat-${pid})`} />
    </svg>
  )
})

/* --------------------------- element renderers ----------------------- */

const TextEl = React.memo(function TextEl({ el }: { el: TextElement }) {
  const style: React.CSSProperties = {
    fontFamily: fontStack(el.fontFamily),
    fontSize: el.fontSize,
    fontWeight: el.fontWeight,
    color: el.color,
    textAlign: el.align,
    fontStyle: el.italic ? 'italic' : 'normal',
    textDecoration: el.underline ? 'underline' : 'none',
    textTransform: el.uppercase ? 'uppercase' : 'none',
    letterSpacing: el.letterSpacing,
    lineHeight: el.lineHeight,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    width: '100%',
    height: '100%',
    overflow: 'visible',
  }
  return <div style={style}>{el.text}</div>
})

const ImageEl = React.memo(function ImageEl({ el }: { el: ImageElement }) {
  return (
    <img
      src={el.src}
      alt={el.name ?? 'card image'}
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: el.fit,
        borderRadius: el.circle ? '50%' : el.radius,
        border: el.borderWidth > 0 ? `${el.borderWidth}px solid ${el.borderColor}` : undefined,
        display: 'block',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      }}
    />
  )
})

const ShapeEl = React.memo(function ShapeEl({ el }: { el: ShapeElement }) {
  if (el.shape === 'ellipse') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: el.fill !== 'none' ? el.fill : 'transparent',
          border: el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
          boxSizing: 'border-box',
        }}
      />
    )
  }
  if (el.shape === 'line') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '100%',
            height: Math.max(2, el.strokeWidth),
            background: el.stroke,
            borderRadius: 999,
          }}
        />
      </div>
    )
  }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: el.fill !== 'none' ? el.fill : 'transparent',
        borderRadius: el.radius,
        border: el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : undefined,
        boxSizing: 'border-box',
      }}
    />
  )
})

const IconEl = React.memo(function IconEl({ el }: { el: IconElement }) {
  const Icon = getIcon(el.icon)
  if (!Icon) return null
  const size = Math.min(el.w, el.h)
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line react-hooks/static-components -- stable icon registry lookup */}
      <Icon size={size} color={el.color} strokeWidth={el.strokeWidth} absoluteStrokeWidth={false} />
    </div>
  )
})

const QrEl = React.memo(function QrEl({ el }: { el: QRElement }) {
  const url = useQrDataUrl(el.data, el.fg, el.bg)
  if (!url) {
    return <div style={{ width: '100%', height: '100%', background: el.bg, borderRadius: 8 }} />
  }
  return <img src={url} alt="QR code" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
})

const StickerEl = React.memo(function StickerEl({ el }: { el: StickerElement }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.min(el.w, el.h) * 0.92,
        lineHeight: 1.1,
        userSelect: 'none',
      }}
    >
      {el.emoji}
    </div>
  )
})

function ElementView({ el }: { el: CardElement }) {
  switch (el.type) {
    case 'text':
      return <TextEl el={el} />
    case 'image':
      return <ImageEl el={el} />
    case 'shape':
      return <ShapeEl el={el} />
    case 'icon':
      return <IconEl el={el} />
    case 'qr':
      return <QrEl el={el} />
    case 'sticker':
      return <StickerEl el={el} />
  }
}

/* ---------------------------- side renderer -------------------------- */

export function CardSideView({
  side,
  width,
  height,
  excludeElementId,
}: {
  side: CardSide
  width: number
  height: number
  /** Element currently being edited inline in the canvas — skipped so its ghost text
   *  doesn't render underneath the live editing textarea. */
  excludeElementId?: string | null
}) {
  const bg = side.background
  return (
    <>
      <div className="absolute inset-0" style={backgroundCss(bg)} />
      {bg.type === 'pattern' && bg.pattern && <PatternLayer bg={bg} w={width} h={height} />}
      {bg.type === 'image' && bg.overlay > 0 && (
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${bg.overlay})` }} />
      )}
      {side.elements.map((el) =>
        el.hidden || el.id === excludeElementId ? null : (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              opacity: el.opacity,
              pointerEvents: 'none',
            }}
          >
            <ElementView el={el} />
          </div>
        ),
      )}
    </>
  )
}

/* ---------------------------- card renderer -------------------------- */

export function CardRenderer({
  design,
  side = 'front',
  radius = 28,
  className,
  style,
  shadow = true,
  excludeElementId,
}: {
  design: CardDesign
  side?: 'front' | 'back'
  radius?: number
  className?: string
  style?: React.CSSProperties
  shadow?: boolean
  excludeElementId?: string | null
}) {
  const cardSide = side === 'back' && design.back ? design.back : design.front
  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        width: design.width,
        height: design.height,
        borderRadius: radius,
        ...(shadow
          ? { boxShadow: '0 18px 50px -12px rgba(15, 23, 42, 0.25), 0 4px 14px rgba(15, 23, 42, 0.08)' }
          : {}),
        ...style,
      }}
    >
      <CardSideView
        side={cardSide}
        width={design.width}
        height={design.height}
        excludeElementId={excludeElementId}
      />
    </div>
  )
}

/* ------------------------- scaled card preview ----------------------- */

export function ScaledCard({
  design,
  side,
  scale,
  maxWidth,
  maxHeight,
  radius = 28,
  className,
}: {
  design: CardDesign
  side?: 'front' | 'back'
  scale?: number
  maxWidth?: number
  maxHeight?: number
  radius?: number
  className?: string
}) {
  const s =
    scale ??
    Math.min((maxWidth ?? 240) / design.width, (maxHeight ?? 240) / design.height)
  return (
    <div
      className={className}
      style={{ width: design.width * s, height: design.height * s, position: 'relative' }}
    >
      <div style={{ transform: `scale(${s})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <CardRenderer design={design} side={side} radius={radius} />
      </div>
    </div>
  )
}
