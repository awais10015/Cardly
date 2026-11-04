import {
  type IconElement, type ImageElement, type QRElement, type ShapeElement,
  type StickerElement, type TextElement, uid,
} from './types'

/* Element factories for the editor panels (fresh ids on every call). */

export function newText(partial: Partial<TextElement> & { x: number; y: number }): TextElement {
  return {
    id: uid('t'), type: 'text', text: 'Your text here', w: 420, h: 60,
    rotation: 0, opacity: 1, locked: false, hidden: false,
    fontFamily: 'Inter', fontSize: 32, fontWeight: 500, color: '#1e293b',
    align: 'left', italic: false, underline: false, uppercase: false,
    letterSpacing: 0, lineHeight: 1.25, ...partial,
  }
}

export function newShape(partial: Partial<ShapeElement> & { x: number; y: number; w: number; h: number }): ShapeElement {
  return {
    id: uid('s'), type: 'shape', shape: 'rect', rotation: 0, opacity: 1, locked: false, hidden: false,
    fill: '#7c3aed', stroke: 'none', strokeWidth: 0, radius: 12, ...partial,
  }
}

export function newLine(partial: Partial<ShapeElement> & { x: number; y: number; w: number }): ShapeElement {
  return {
    id: uid('l'), type: 'shape', shape: 'line', h: 8, rotation: 0, opacity: 1, locked: false, hidden: false,
    fill: 'none', stroke: '#1e293b', strokeWidth: 3, radius: 0, ...partial,
  }
}

export function newEllipse(partial: Partial<ShapeElement> & { x: number; y: number; w: number; h: number }): ShapeElement {
  return {
    id: uid('e'), type: 'shape', shape: 'ellipse', rotation: 0, opacity: 1, locked: false, hidden: false,
    fill: 'none', stroke: '#7c3aed', strokeWidth: 4, radius: 0, ...partial,
  }
}

export function newIcon(partial: Partial<IconElement> & { x: number; y: number; w: number; h: number; icon: string }): IconElement {
  return {
    id: uid('i'), type: 'icon', rotation: 0, opacity: 1, locked: false, hidden: false,
    color: '#334155', strokeWidth: 2, ...partial,
  }
}

export function newSticker(partial: Partial<StickerElement> & { x: number; y: number; w: number; h: number; emoji: string }): StickerElement {
  return {
    id: uid('k'), type: 'sticker', rotation: 0, opacity: 1, locked: false, hidden: false, ...partial,
  }
}

export function newQr(partial: Partial<QRElement> & { x: number; y: number; w: number; h: number }): QRElement {
  return {
    id: uid('q'), type: 'qr', data: 'https://cardly.app/hello', rotation: 0, opacity: 1,
    locked: false, hidden: false, fg: '#0f172a', bg: '#ffffff', ...partial,
  }
}

export function newImage(partial: Partial<ImageElement> & { x: number; y: number; w: number; h: number; src: string }): ImageElement {
  return {
    id: uid('m'), type: 'image', fit: 'cover', rotation: 0, opacity: 1, locked: false, hidden: false,
    radius: 16, borderWidth: 0, borderColor: '#ffffff', circle: false, ...partial,
  }
}
