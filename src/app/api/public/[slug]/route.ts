import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** Public endpoint — renders any published card by its slug, no auth needed. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params
    const card = await db.card.findFirst({ where: { slug, status: 'published' } })
    if (!card) return NextResponse.json({ error: 'This card is not available.' }, { status: 404 })
    return NextResponse.json({
      card: {
        id: card.id,
        title: card.title,
        category: card.category,
        slug: card.slug,
        status: card.status,
        design: JSON.parse(card.design),
        business: card.business ? JSON.parse(card.business) : null,
        invitation: card.invitation ? JSON.parse(card.invitation) : null,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      },
    })
  } catch (err) {
    console.error('public card error', err)
    return NextResponse.json({ error: 'Could not load the card.' }, { status: 500 })
  }
}
