#!/usr/bin/env node
/**
 * Syncs the Prisma datasource `provider` in schema.prisma with DB_PROVIDER
 * from the environment (sqlite | postgresql | mysql). SQLite is the default
 * so local dev works with zero configuration.
 *
 *   DB_PROVIDER=postgresql npm run db:push
 *   npm run db:setup          # uses whatever .env contains
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const schemaPath = resolve(root, 'prisma/schema.prisma')

const VALID = ['sqlite', 'postgresql', 'mysql']
const wanted = (process.env.DB_PROVIDER || process.env.npm_config_db_provider || 'sqlite').toLowerCase()
if (!VALID.includes(wanted)) {
  console.error(`✖ DB_PROVIDER="${wanted}" is not valid. Use one of: ${VALID.join(', ')}`)
  process.exit(1)
}

let schema = readFileSync(schemaPath, 'utf8')
const current = schema.match(/provider\s*=\s*"(sqlite|postgresql|mysql)"/)?.[1]

if (current === wanted) {
  console.log(`✔ Prisma provider already "${wanted}" — schema unchanged.`)
  process.exit(0)
}

schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql|mysql)"/, `provider = "${wanted}"`)
writeFileSync(schemaPath, schema)
console.log(`✔ Prisma provider switched: ${current} → ${wanted}`)
console.warn('  Reminder: run `npm run db:push` (and migrate your data — provider switch starts empty).')
