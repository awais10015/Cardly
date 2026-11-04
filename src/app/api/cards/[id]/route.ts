import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth-server'

function shape(card: {
  id: string; title: string; category: string; slug: string | null; status: string;
  design: string; business: string | null; invitation: string | null; createdAt: Date; updatedAt: Date
}) {
  return {
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
  }
}

async function ownedCard(id: string, userId: string) {
  return db.card.findFirst({ where: { id, userId } })
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    const { id } = await ctx.params
    const card = await ownedCard(id, session.id)
    if (!card) return NextResponse.json({ error: 'Card not found.' }, { status: 404 })
    return NextResponse.json({ card: shape(card) })
  } catch (err) {
    console.error('card get error', err)
    return NextResponse.json({ error: 'Could not load the card.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Sign in to save cards.' }, { status: 401 })
    const { id } = await ctx.params
    const existing = await ownedCard(id, session.id)
    if (!existing) return NextResponse.json({ error: 'Card not found.' }, { status: 404 })

    const body = (await req.json()) as {
      title?: string; category?: string; design?: unknown;
      business?: unknown; invitation?: unknown; publish?: boolean; unpublish?: boolean
    }

    let status = existing.status
    let slug = existing.slug
    if (body.publish) {
      status = 'published'
      if (!slug) slug = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
    }
    if (body.unpublish) {
      status = 'draft'
    }

    const card = await db.card.update({
      where: { id: existing.id },
      data: {
        title: body.title !== undefined ? body.title.slice(0, 120) : undefined,
        category: body.category ?? undefined,
        design: body.design !== undefined ? JSON.stringify(body.design) : undefined,
        business: body.business !== undefined ? (body.business ? JSON.stringify(body.business) : null) : undefined,
        invitation: body.invitation !== undefined ? (body.invitation ? JSON.stringify(body.invitation) : null) : undefined,
        status,
        slug,
      },
    })
    return NextResponse.json({ card: shape(card) })
  } catch (err) {
    console.error('card update error', err)
    return NextResponse.json({ error: 'Could not save the card.' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    const { id } = await ctx.params
    const existing = await ownedCard(id, session.id)
    if (!existing) return NextResponse.json({ error: 'Card not found.' }, { status: 404 })
    await db.card.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('card delete error', err)
    return NextResponse.json({ error: 'Could not delete the card.' }, { status: 500 })
  }
}
