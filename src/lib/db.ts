import 'server-only'
import crypto from 'node:crypto'
import { MongoClient, ReturnDocument, type Db, type Document, type Filter } from 'mongodb'
import { env } from '@/lib/env'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MongoDB data layer.
 *
 *  Exposes the same tiny call surface the app has always used
 *  (db.user.findUnique / db.card.findMany / …) so routes stay simple, but
 *  every call is backed by MongoDB. Documents are returned as plain objects
 *  shaped exactly like the old Prisma models: string `id`, Date timestamps,
 *  design/business/invitation stored as JSON strings.
 *
 *  Connection target comes from the environment:
 *    MONGODB_URI  — e.g. mongodb://127.0.0.1:27017  or  mongodb+srv://…/cardly
 *    MONGODB_DB   — database name when the URI has no /db suffix (default cardly)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface UserDoc {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface CardDoc {
  id: string
  userId: string
  title: string
  category: string
  slug: string | null
  status: string
  design: string
  business: string | null
  invitation: string | null
  createdAt: Date
  updatedAt: Date
}

type UserInput = Partial<Omit<UserDoc, 'id' | 'createdAt' | 'updatedAt'>> & { email: string; name: string; passwordHash: string }
type CardInput = Partial<Omit<CardDoc, 'id' | 'createdAt' | 'updatedAt'>> & { userId: string; title: string; category: string; status: string; design: string }
type CardPatch = Partial<Omit<CardDoc, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
type UserPatch = Partial<Omit<UserDoc, 'id' | 'createdAt' | 'updatedAt'>>

/** Raw storage rows — string `_id` keeps every lookup string-based. */
interface UserRow extends Document { _id: string; email: string; name: string; passwordHash: string; createdAt: Date; updatedAt: Date }
interface CardRow extends Document {
  _id: string; userId: string; title: string; category: string; status: string; design: string
  slug?: string | null; business?: string | null; invitation?: string | null
  createdAt: Date; updatedAt: Date
}

/** 24-hex random id — same shape as an ObjectId string. */
function newId(): string {
  return crypto.randomBytes(12).toString('hex')
}

/** Strips Mongo internals and exposes the Prisma-style flat shape. */
function shapeUser(d: UserRow): UserDoc {
  return {
    id: d._id,
    email: d.email,
    name: d.name,
    passwordHash: d.passwordHash,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

function shapeCard(d: CardRow): CardDoc {
  return {
    id: d._id,
    userId: d.userId,
    title: d.title,
    category: d.category,
    slug: d.slug ?? null,
    status: d.status,
    design: d.design,
    business: d.business ?? null,
    invitation: d.invitation ?? null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

/* --------------------------- connection plumbing --------------------------- */

const globalForMongo = globalThis as unknown as {
  __cardlyMongo?: Promise<{ client: MongoClient; database: Db }>
}

/** Database name: a `/dbname` suffix in the URI wins, else MONGODB_DB, else `cardly`. */
function resolveDbName(): string {
  let fromUri = ''
  try {
    fromUri = new URL(env.mongoUri).pathname.replace(/^\//, '').trim()
  } catch {
    /* URI already validated by env.ts */
  }
  return fromUri || env.mongoDb || 'cardly'
}

async function connect(): Promise<{ client: MongoClient; database: Db }> {
  const client = new MongoClient(env.mongoUri, {
    serverSelectionTimeoutMS: 5_000, // fail fast (health endpoint) when mongod is down
    connectTimeoutMS: 5_000,
  })
  await client.connect()
  const database = client.db(resolveDbName())

  // Idempotent indexes (created once per boot, no-ops afterwards).
  await Promise.all([
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
    database.collection('cards').createIndex({ userId: 1 }),
    database.collection('cards').createIndex(
      { slug: 1 },
      { unique: true, partialFilterExpression: { slug: { $type: 'string' } } },
    ),
  ])

  return { client, database }
}

function mongo(): Promise<{ client: MongoClient; database: Db }> {
  if (!globalForMongo.__cardlyMongo) {
    globalForMongo.__cardlyMongo = connect().catch((err) => {
      globalForMongo.__cardlyMongo = undefined // allow retry on next call
      console.error('[db] MongoDB connection failed —', err instanceof Error ? err.message : err)
      throw err
    })
  }
  return globalForMongo.__cardlyMongo
}

/* ------------------------------- the `db` API ------------------------------ */

export const db = {
  /** Health check — replaces the old `SELECT 1`. */
  async ping(): Promise<void> {
    const { client } = await mongo()
    await client.db('admin').command({ ping: 1 })
  },

  user: {
    async findUnique({ where, select }: { where: { id?: string; email?: string }; select?: { id?: boolean; email?: boolean; name?: boolean } }): Promise<UserDoc | null> {
      const { database } = await mongo()
      const filter: Filter<UserRow> = where.id
        ? { _id: where.id }
        : { email: (where.email ?? '').toLowerCase() }
      const doc = await database.collection<UserRow>('users').findOne(filter)
      if (!doc) return null
      // `select` narrows the returned fields (Prisma semantics). Extra keys are
      // dropped so nothing sensitive (passwordHash) can leak through a select.
      if (select) {
        const picked = Object.fromEntries(
          Object.entries(shapeUser(doc)).filter(([k]) => (select as Record<string, boolean>)[k]),
        ) as UserDoc
        return picked
      }
      return shapeUser(doc)
    },

    /** findFirst({ where: { email, NOT: { id } } }) — email clash check. */
    async findFirst({ where }: { where: { email?: string; NOT?: { id: string } } }): Promise<UserDoc | null> {
      const { database } = await mongo()
      const filter: Filter<UserRow> = {}
      if (where.email) filter.email = where.email.toLowerCase()
      if (where.NOT?.id) filter._id = { $ne: where.NOT.id }
      const doc = await database.collection<UserRow>('users').findOne(filter)
      return doc ? shapeUser(doc) : null
    },

    async create({ data }: { data: UserInput }): Promise<UserDoc> {
      const { database } = await mongo()
      const now = new Date()
      const doc: UserRow = { _id: newId(), ...data, email: data.email.toLowerCase(), createdAt: now, updatedAt: now }
      await database.collection<UserRow>('users').insertOne(doc)
      return shapeUser(doc)
    },

    async update({ where, data }: { where: { id: string }; data: UserPatch }): Promise<UserDoc> {
      const { database } = await mongo()
      const patch: Document = { updatedAt: new Date() }
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) patch[k] = k === 'email' ? String(v).toLowerCase() : v
      }
      const doc = await database.collection<UserRow>('users').findOneAndUpdate(
        { _id: where.id },
        { $set: patch },
        { returnDocument: ReturnDocument.AFTER },
      )
      if (!doc) throw new Error(`[db] user ${where.id} not found`)
      return shapeUser(doc)
    },
  },

  card: {
    async findMany({ where, orderBy }: { where: { userId: string }; orderBy?: { updatedAt: 'asc' | 'desc' } }): Promise<CardDoc[]> {
      const { database } = await mongo()
      const sort: Document = orderBy?.updatedAt === 'asc' ? { updatedAt: 1 } : { updatedAt: -1 }
      const docs = await database
        .collection<CardRow>('cards')
        .find({ userId: where.userId })
        .sort(sort)
        .toArray()
      return docs.map(shapeCard)
    },

    async findFirst({ where }: { where: { id?: string; userId?: string; slug?: string; status?: string } }): Promise<CardDoc | null> {
      const { database } = await mongo()
      const filter: Filter<CardRow> = {}
      if (where.id) filter._id = where.id
      if (where.userId) filter.userId = where.userId
      if (where.slug) filter.slug = where.slug
      if (where.status) filter.status = where.status
      const doc = await database.collection<CardRow>('cards').findOne(filter)
      return doc ? shapeCard(doc) : null
    },

    async create({ data }: { data: CardInput }): Promise<CardDoc> {
      const { database } = await mongo()
      const now = new Date()
      const doc: CardRow = {
        _id: newId(),
        userId: data.userId,
        title: data.title,
        category: data.category,
        status: data.status,
        design: data.design,
        createdAt: now,
        updatedAt: now,
      }
      if (data.slug) doc.slug = data.slug
      if (data.business != null) doc.business = data.business
      if (data.invitation != null) doc.invitation = data.invitation
      await database.collection<CardRow>('cards').insertOne(doc)
      return shapeCard(doc)
    },

    async update({ where, data }: { where: { id: string }; data: CardPatch }): Promise<CardDoc> {
      const { database } = await mongo()
      // undefined = leave unchanged (Prisma semantics); explicit null clears.
      const patch: Document = { updatedAt: new Date() }
      for (const [k, v] of Object.entries(data)) {
        if (v === undefined) continue
        patch[k] = v
      }
      const doc = await database.collection<CardRow>('cards').findOneAndUpdate(
        { _id: where.id },
        { $set: patch },
        { returnDocument: ReturnDocument.AFTER },
      )
      if (!doc) throw new Error(`[db] card ${where.id} not found`)
      return shapeCard(doc)
    },

    async delete({ where }: { where: { id: string } }): Promise<void> {
      const { database } = await mongo()
      await database.collection<CardRow>('cards').deleteOne({ _id: where.id })
    },
  },
}
