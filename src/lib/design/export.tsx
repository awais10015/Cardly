'use client'

import * as React from 'react'
import { toPng, toJpeg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import type { CardDesign, BusinessFields } from './types'
import { CardRenderer } from './renderer'

/* ------------------------- offscreen rendering ----------------------- */

let exportHost: HTMLDivElement | null = null

function getExportHost(): HTMLDivElement {
  if (!exportHost) {
    exportHost = document.createElement('div')
    exportHost.style.cssText =
      'position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;opacity:0;'
    document.body.appendChild(exportHost)
  }
  return exportHost
}

function renderOffscreen(
  design: CardDesign,
  side: 'front' | 'back',
): Promise<{ node: HTMLElement; cleanup: () => void }> {
  return new Promise((resolve) => {
    const host = getExportHost()
    const wrap = document.createElement('div')
    wrap.style.cssText = `width:${design.width}px;height:${design.height}px;`
    host.appendChild(wrap)
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(wrap)
      root.render(<CardRenderer design={design} side={side} radius={28} shadow={false} />)
      // wait two frames for images / QR codes to paint
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          resolve({
            node: wrap,
            cleanup: () => {
              setTimeout(() => {
                root.unmount()
                wrap.remove()
              }, 50)
            },
          })
        }),
      )
    })
  })
}

async function snapshot(
  design: CardDesign,
  side: 'front' | 'back',
  opts: { type: 'png' | 'jpeg'; pixelRatio: number },
): Promise<string> {
  const { node, cleanup } = await renderOffscreen(design, side)
  try {
    const fn = opts.type === 'png' ? toPng : toJpeg
    const options = {
      pixelRatio: opts.pixelRatio,
      width: design.width,
      height: design.height,
      cacheBust: true,
      quality: 0.96,
      backgroundColor: opts.type === 'jpeg' ? '#ffffff' : undefined,
    }
    // warm-up pass at tiny scale helps html-to-image resolve fonts & images
    await fn(node, { ...options, pixelRatio: 0.1 })
    return await fn(node, options)
  } finally {
    cleanup()
  }
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 48) || 'card'
  )
}

/* ------------------------------ exports ------------------------------ */

export async function exportPng(design: CardDesign, side: 'front' | 'back', name: string, pixelRatio = 2) {
  const url = await snapshot(design, side, { type: 'png', pixelRatio })
  triggerDownload(url, `${slugify(name)}-${side}-cardly.png`)
}

export async function exportJpg(design: CardDesign, side: 'front' | 'back', name: string, pixelRatio = 2) {
  const url = await snapshot(design, side, { type: 'jpeg', pixelRatio })
  triggerDownload(url, `${slugify(name)}-${side}-cardly.jpg`)
}

export async function exportPdf(design: CardDesign, sides: ('front' | 'back')[], name: string) {
  const wIn = design.width / 300
  const hIn = design.height / 300
  const landscape = design.width >= design.height
  const doc = new jsPDF({
    orientation: landscape ? 'landscape' : 'portrait',
    unit: 'in',
    format: landscape ? [hIn, wIn] : [wIn, hIn],
  })
  for (let i = 0; i < sides.length; i++) {
    const url = await snapshot(design, sides[i], { type: 'png', pixelRatio: 2 })
    if (i > 0) doc.addPage([wIn, hIn], landscape ? 'landscape' : 'portrait')
    doc.addImage(url, 'PNG', 0, 0, wIn, hIn)
  }
  doc.save(`${slugify(name)}-cardly.pdf`)
}

/* ------------------------------- vCard ------------------------------- */

function vcardEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function buildVCard(b: BusinessFields): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${vcardEscape(b.fullName)};;;;`,
    `FN:${vcardEscape(b.fullName)}`,
    `ORG:${vcardEscape(b.company)}`,
    `TITLE:${vcardEscape(b.jobTitle)}`,
  ]
  if (b.phone) lines.push(`TEL;TYPE=CELL:${b.phone}`)
  if (b.whatsapp) lines.push(`TEL;TYPE=WHATSAPP:${b.whatsapp}`)
  if (b.email) lines.push(`EMAIL;TYPE=INTERNET:${b.email}`)
  if (b.website) lines.push(`URL:${b.website.startsWith('http') ? b.website : `https://${b.website}`}`)
  if (b.address) lines.push(`ADR;TYPE=WORK:;;${vcardEscape(b.address)};;;;`)
  if (b.socials.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${b.socials.linkedin}`)
  if (b.socials.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${b.socials.instagram}`)
  if (b.socials.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${b.socials.twitter}`)
  lines.push('NOTE:Created with Cardly — Digital Card Maker', 'END:VCARD')
  return lines.join('\r\n')
}

export function downloadVCard(b: BusinessFields, name: string) {
  const blob = new Blob([buildVCard(b)], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${slugify(name)}-contact.vcf`)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export function downloadText(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/* --------------------------- image processing ------------------------ */

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Resize an uploaded image so designs stay light (max dimension 1400px). */
export async function normalizeUpload(file: File, maxDim = 1400): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Invalid image'))
    img.src = dataUrl
  })
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  if (scale === 1 && dataUrl.length < 900_000) return dataUrl
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const isPng = file.type.includes('png')
  return canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.88)
}

/* ---------------------------- web share api -------------------------- */

export async function shareViaWebShare(payload: {
  title: string
  text: string
  url?: string
}): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.share) return 'unsupported'
  try {
    await navigator.share(payload)
    return 'shared'
  } catch (err) {
    if ((err as Error).name === 'AbortError') return 'cancelled'
    return 'unsupported'
  }
}

export function useAsyncTask() {
  const [running, setRunning] = React.useState(false)
  const run = React.useCallback(async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
    setRunning(true)
    try {
      return await task()
    } finally {
      setRunning(false)
    }
  }, [])
  return { running, run }
}
