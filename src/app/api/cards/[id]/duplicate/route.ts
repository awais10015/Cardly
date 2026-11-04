import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth-server'

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    const { id } = await ctx.params
    const existing = await db.card.findFirst({ where: { id, userId: session.id } })
    if (!existing) return NextResponse.json({ error: 'Card not found.' }, { status: 404 })
    const card = await db.card.create({
      data: {
        userId: session.id,
        title: `${existing.title} (copy)`.slice(0, 120),
        category: existing.category,
        status: 'draft',
        slug: null,
        design: existing.design,
        business: existing.business,
        invitation: existing.invitation,
      },
    })
    return NextResponse.json({
      card: {
        id: card.id,
        title: card.title,
        category: card.category,
        slug: card.slug ?? undefined,
        status: card.status as 'draft' | 'published',
        design: JSON.parse(card.design),
        business: card.business ? JSON.parse(card.business) : null,
        invitation: card.invitation ? JSON.parse(card.invitation) : null,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('card duplicate error', err)
    return NextResponse.json({ error: 'Could not duplicate the card.' }, { status: 500 })
  }
}
