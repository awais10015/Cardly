import 'server-only'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth-server'
import { env } from '@/lib/env'
import { instantiateTemplate, getTemplate } from '@/lib/design/templates'
import type { CardDesign } from '@/lib/design/types'

export const DEMO_EMAIL = env.demoEmail
export const DEMO_PASSWORD = env.demoPassword

/**
 * Idempotently ensures the demo account exists with a few sample cards.
 * Called from auth routes so the sandbox database always has data.
 * No-op when DEMO_MODE is disabled via the environment.
 */
export async function ensureDemoUser(): Promise<{ id: string; email: string; name: string }> {
  if (!env.demoMode) {
    throw new Error('Demo mode is disabled (DEMO_MODE=off).')
  }
  const existing = await db.user.findUnique({ where: { email: DEMO_EMAIL } })
  if (existing) return existing

  const user = await db.user.create({
    data: {
      email: DEMO_EMAIL,
      name: 'Demo Creator',
      passwordHash: hashPassword(DEMO_PASSWORD),
    },
  })

  const samples: { templateId: string; title: string; status: 'draft' | 'published'; overrides?: Record<string, string> }[] = [
    { templateId: 'tpl-biz-noir', title: 'Alexandra — Noir Gold', status: 'published' },
    { templateId: 'tpl-wed-blush', title: 'Amara & Zahid Wedding', status: 'published', overrides: { hostName: 'Amara & Zahid' } },
    { templateId: 'tpl-bday-confetti', title: "Maya's 8th Birthday", status: 'draft' },
    { templateId: 'tpl-eid-emerald', title: 'Eid Greetings 2026', status: 'draft' },
  ]

  for (const sample of samples) {
    const tpl = getTemplate(sample.templateId)
    if (!tpl) continue
    const { design } = instantiateTemplate(tpl)
    let finalDesign: CardDesign = design
    if (sample.overrides) {
      finalDesign = JSON.parse(JSON.stringify(design))
      for (const side of [finalDesign.front, finalDesign.back]) {
        if (!side) continue
        for (const el of side.elements) {
          if (el.type === 'text' && el.role && sample.overrides[el.role]) {
            el.text = sample.overrides[el.role]
          }
        }
      }
    }
    await db.card.create({
      data: {
        userId: user.id,
        title: sample.title,
        category: tpl.category,
        status: sample.status,
        slug: sample.status === 'published' ? `demo-${tpl.id.replace('tpl-', '')}` : null,
        design: JSON.stringify(finalDesign),
        business: tpl.business ? JSON.stringify(tpl.business) : null,
      },
    })
  }

  return user
}
