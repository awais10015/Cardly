'use client'

import * as React from 'react'
import { CardRenderer } from '@/lib/design/renderer'
import { useEditor } from '@/lib/stores/editor-store'
import type { CardDesign, CardElement, TextElement } from '@/lib/design/types'
import { cn } from '@/lib/utils'

type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface Gesture {
  mode: 'move' | 'resize' | 'rotate'
  handle?: HandleId
  id: string
  startX: number
  startY: number
  orig: CardElement
}

const HANDLES: { id: HandleId; cursor: string; x: number; y: number }[] = [
  { id: 'nw', cursor: 'nwse-resize', x: 0, y: 0 },
  { id: 'n', cursor: 'ns-resize', x: 0.5, y: 0 },
  { id: 'ne', cursor: 'nesw-resize', x: 1, y: 0 },
  { id: 'e', cursor: 'ew-resize', x: 1, y: 0.5 },
  { id: 'se', cursor: 'nwse-resize', x: 1, y: 1 },
  { id: 's', cursor: 'ns-resize', x: 0.5, y: 1 },
  { id: 'sw', cursor: 'nesw-resize', x: 0, y: 1 },
  { id: 'w', cursor: 'ew-resize', x: 0, y: 0.5 },
]

export function EditorCanvas() {
  const design = useEditor((s) => s.design)
  const activeSide = useEditor((s) => s.activeSide)
  const zoom = useEditor((s) => s.zoom)
  const selectedId = useEditor((s) => s.selectedId)
  const editingId = useEditor((s) => s.editingId)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const [avail, setAvail] = React.useState({ w: 800, h: 600 })
  const [guides, setGuides] = React.useState<{ v: number | null; h: number | null }>({ v: null, h: null })
  const gestureRef = React.useRef<Gesture | null>(null)
  const [gesturing, setGesturing] = React.useState(false)

  const side = activeSide === 'back' && design.back ? design.back : design.front

  // measure available space for fit-to-screen
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setAvail({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setAvail({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const fitScale = Math.min((avail.w - 56) / design.width, (avail.h - 56) / design.height, 1.4)
  const scale = zoom === 'fit' ? Math.max(fitScale, 0.05) : zoom

  const beginGesture = (mode: Gesture['mode'], el: CardElement, e: React.PointerEvent, handle?: HandleId) => {
    if (el.locked) return
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    gestureRef.current = {
      mode,
      handle,
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      orig: JSON.parse(JSON.stringify(el)),
    }
    useEditor.getState().startContinuous()
    setGesturing(true)
  }

  // window-level move / up handlers
  React.useEffect(() => {
    if (!gesturing) return

    const onMove = (e: PointerEvent) => {
      const g = gestureRef.current
      if (!g) return
      const store = useEditor.getState()
      const dx = (e.clientX - g.startX) / scale
      const dy = (e.clientY - g.startY) / scale
      const o = g.orig

      if (g.mode === 'move') {
        // transform delta into element space when rotated
        const rad = (-o.rotation * Math.PI) / 180
        const mdx = dx * Math.cos(rad) - dy * Math.sin(rad)
        const mdy = dx * Math.sin(rad) + dy * Math.cos(rad)
        let nx = o.x + mdx
        let ny = o.y + mdy

        // snapping: centers + edges
        const th = 7 / scale
        let vGuide: number | null = null
        let hGuide: number | null = null
        const cX = nx + o.w / 2
        const cY = ny + o.h / 2
        if (Math.abs(cX - design.width / 2) < th) {
          nx = design.width / 2 - o.w / 2
          vGuide = design.width / 2
        } else if (Math.abs(nx) < th) {
          nx = 0
          vGuide = 0
        } else if (Math.abs(nx + o.w - design.width) < th) {
          nx = design.width - o.w
          vGuide = design.width
        }
        if (Math.abs(cY - design.height / 2) < th) {
          ny = design.height / 2 - o.h / 2
          hGuide = design.height / 2
        } else if (Math.abs(ny) < th) {
          ny = 0
          hGuide = 0
        } else if (Math.abs(ny + o.h - design.height) < th) {
          ny = design.height - o.h
          hGuide = design.height
        }
        setGuides({ v: vGuide, h: hGuide })
        // clamp so elements can't be lost far outside the canvas
        nx = Math.min(Math.max(nx, -o.w + 24), design.width - 24)
        ny = Math.min(Math.max(ny, -o.h + 24), design.height - 24)
        store.updateElement(g.id, { x: Math.round(nx), y: Math.round(ny) })
      } else if (g.mode === 'resize' && g.handle) {
        const keepAspect = e.shiftKey || ['image', 'icon', 'sticker', 'qr'].includes(o.type)
        let { x, y, w, h } = o
        const min = 28
        const applyCorner = (dw: number, dh: number) => {
          w = Math.max(min, o.w + dw)
          h = Math.max(min, o.h + dh)
          if (keepAspect) {
            const ratio = o.w / o.h
            if (dw !== 0 && dh !== 0) {
              if (Math.abs(w - o.w) > Math.abs(h - o.h)) h = w / ratio
              else w = h * ratio
            } else if (dw !== 0) h = w / ratio
            else w = h * ratio
          }
        }
        switch (g.handle) {
          case 'e':
            applyCorner(dx, 0)
            break
          case 'w':
            applyCorner(-dx, 0)
            x = o.x + (o.w - w)
            break
          case 's':
            applyCorner(0, dy)
            break
          case 'n':
            applyCorner(0, -dy)
            y = o.y + (o.h - h)
            break
          case 'se':
            applyCorner(dx, dy)
            break
          case 'ne':
            applyCorner(dx, -dy)
            y = o.y + (o.h - h)
            break
          case 'sw':
            applyCorner(-dx, dy)
            x = o.x + (o.w - w)
            break
          case 'nw':
            applyCorner(-dx, -dy)
            x = o.x + (o.w - w)
            y = o.y + (o.h - h)
            break
        }
        store.updateElement(g.id, { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) })
      } else if (g.mode === 'rotate') {
        const cardEl = document.getElementById('cardly-card-root')
        const rect = cardEl?.getBoundingClientRect()
        if (rect) {
          const cx = rect.left + ((o.x + o.w / 2) * scale)
          const cy = rect.top + ((o.y + o.h / 2) * scale)
          let deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90
          if (e.shiftKey) deg = Math.round(deg / 15) * 15
          else if (Math.abs(deg % 90) < 3 || Math.abs((deg % 90) - 90) < 3) deg = Math.round(deg / 90) * 90
          store.updateElement(g.id, { rotation: Math.round(deg) })
        }
      }
    }

    const onUp = () => {
      gestureRef.current = null
      setGuides({ v: null, h: null })
      setGesturing(false)
      useEditor.getState().endContinuous()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gesturing, scale, design.width, design.height])

  const sel = side.elements.find((el) => el.id === selectedId) ?? null

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop) {
          useEditor.getState().select(null)
          useEditor.getState().setEditing(null)
        }
      }}
    >
      <div className="relative" style={{ width: design.width * scale, height: design.height * scale }}>
        <div
          id="cardly-card-root"
          className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-[28px] shadow-2xl shadow-black/25"
          style={{ width: design.width, height: design.height, transform: `scale(${scale})` }}
        >
          <CardRenderer design={design} side={activeSide} radius={28} shadow={false} />

          {/* ---------- interaction layer ---------- */}
          <div data-backdrop="true" className="absolute inset-0" style={{ pointerEvents: gesturing ? 'none' : 'auto' }}>
            {side.elements.map((el) =>
              el.hidden ? null : (
                <div
                  key={el.id}
                  data-el-hit
                  className={cn('absolute', el.locked ? 'cursor-default' : 'cursor-move')}
                  style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
                  onPointerDown={(e) => {
                    if (editingId) return
                    useEditor.getState().select(el.id)
                    beginGesture('move', el, e)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    if (el.type === 'text' && !el.locked) {
                      useEditor.getState().setEditing(el.id)
                    }
                  }}
                />
              ),
            )}
          </div>

          {/* ---------- inline text editing ---------- */}
          {editingId &&
            side.elements.map((el) => {
              if (el.id !== editingId || el.type !== 'text') return null
              return (
                <TextEditingBox
                  key={el.id}
                  el={el as TextElement}
                  onCommit={(text) => {
                    useEditor.getState().updateElement(el.id, { text })
                    useEditor.getState().syncRoleText(el.role ?? '', text)
                    useEditor.getState().setEditing(null)
                  }}
                  onCancel={() => useEditor.getState().setEditing(null)}
                />
              )
            })}

          {/* ---------- selection overlay ---------- */}
          {sel && !gesturing && !sel.hidden && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: sel.x,
                top: sel.y,
                width: sel.w,
                height: sel.h,
                transform: sel.rotation ? `rotate(${sel.rotation}deg)` : undefined,
                outline: `${2 / scale}px solid hsl(262 83% 58%)`,
                outlineOffset: 0,
              }}
            >
              {!sel.locked &&
                HANDLES.map((h) => (
                  <button
                    key={h.id}
                    aria-label={`Resize ${h.id}`}
                    className="absolute rounded-[2px] border border-violet-600 bg-white shadow"
                    style={{
                      width: 10 / scale,
                      height: 10 / scale,
                      left: `calc(${h.x * 100}% - ${5 / scale}px)`,
                      top: `calc(${h.y * 100}% - ${5 / scale}px)`,
                      cursor: h.cursor,
                      pointerEvents: 'auto',
                    }}
                    onPointerDown={(e) => beginGesture('resize', sel, e, h.id)}
                  />
                ))}
              {!sel.locked && (
                <button
                  aria-label="Rotate"
                  className="absolute grid place-items-center rounded-full border border-violet-600 bg-white shadow"
                  style={{
                    width: 14 / scale,
                    height: 14 / scale,
                    left: `calc(50% - ${7 / scale}px)`,
                    top: 28 / scale,
                    cursor: 'grab',
                    pointerEvents: 'auto',
                  }}
                  onPointerDown={(e) => beginGesture('rotate', sel, e)}
                >
                  <span
                    className="block rounded-full bg-violet-600"
                    style={{ width: 5 / scale, height: 5 / scale }}
                  />
                </button>
              )}
            </div>
          )}

          {/* ---------- snap guides ---------- */}
          {guides.v !== null && (
            <div
              className="pointer-events-none absolute bg-fuchsia-500"
              style={{ left: guides.v, top: 0, width: 1 / scale, height: design.height }}
            />
          )}
          {guides.h !== null && (
            <div
              className="pointer-events-none absolute bg-fuchsia-500"
              style={{ top: guides.h, left: 0, height: 1 / scale, width: design.width }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/** Inline textarea that matches the element's text styling. */
function TextEditingBox({
  el,
  onCommit,
  onCancel,
}: {
  el: TextElement
  onCommit: (text: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = React.useState(el.text)
  const ref = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel()
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          onCommit(value)
        }
        e.stopPropagation()
      }}
      className="absolute z-20 resize-none overflow-hidden bg-white/5 outline-2 outline-dashed outline-violet-500"
      style={{
        left: el.x,
        top: el.y,
        width: el.w,
        height: Math.max(el.h, el.fontSize * el.lineHeight * 1.4),
        fontFamily:
          {
            Inter: "'Inter', sans-serif",
            'Space Grotesk': "'Space Grotesk', sans-serif",
            'Playfair Display': "'Playfair Display', serif",
            'Cormorant Garamond': "'Cormorant Garamond', serif",
            'Great Vibes': "'Great Vibes', cursive",
            'Dancing Script': "'Dancing Script', cursive",
            'Bebas Neue': "'Bebas Neue', sans-serif",
            Caveat: "'Caveat', cursive",
          }[el.fontFamily] ?? 'sans-serif',
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        color: el.color,
        textAlign: el.align,
        lineHeight: el.lineHeight,
        letterSpacing: el.letterSpacing,
        fontStyle: el.italic ? 'italic' : 'normal',
        textTransform: el.uppercase ? 'uppercase' : 'none',
        padding: 0,
        border: 'none',
      }}
    />
  )
}

/** Helper used by the left panel to place new elements near the center. */
export function centeredPlacement(design: CardDesign, w: number, h: number, index = 0) {
  return {
    x: Math.round((design.width - w) / 2 + (index % 3) * 16),
    y: Math.round((design.height - h) / 2 + (index % 3) * 16),
  }
}
