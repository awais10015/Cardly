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

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    const search = req.nextUrl.searchParams.get('search')?.toLowerCase() ?? ''
    const cards = await db.card.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: 'desc' },
    })
    const filtered = search
      ? cards.filter((c) => c.title.toLowerCase().includes(search) || c.category.includes(search))
      : cards
    return NextResponse.json({ cards: filtered.map(shape) })
  } catch (err) {
    console.error('cards list error', err)
    return NextResponse.json({ error: 'Could not load your cards.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser()
    if (!session) return NextResponse.json({ error: 'Sign in to save cards.' }, { status: 401 })
    const body = (await req.json()) as {
      title?: string; category?: string; design?: unknown; status?: string;
      business?: unknown; invitation?: unknown
    }
    if (!body.design || !body.title) {
      return NextResponse.json({ error: 'Title and design are required.' }, { status: 400 })
    }
    const published = body.status === 'published'
    const card = await db.card.create({
      data: {
        userId: session.id,
        title: body.title.slice(0, 120),
        category: body.category ?? 'custom',
        status: published ? 'published' : 'draft',
        slug: published ? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` : null,
        design: JSON.stringify(body.design),
        business: body.business ? JSON.stringify(body.business) : null,
        invitation: body.invitation ? JSON.stringify(body.invitation) : null,
      },
    })
    return NextResponse.json({ card: shape(card) })
  } catch (err) {
    console.error('card create error', err)
    return NextResponse.json({ error: 'Could not save the card.' }, { status: 500 })
  }
}
