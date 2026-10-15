import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

declare global {
  var __openmasjid_pg: ReturnType<typeof postgres> | undefined
}

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Use the Supabase Transaction pooler URL (port 6543) — see .env.example.',
    )
  }
  return postgres(url, {
    // Transaction pooler (PgBouncer) does not support prepared statements.
    prepare: false,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  })
}

// Reuse the connection across HMR reloads in dev.
const client = globalThis.__openmasjid_pg ?? createClient()
if (process.env.NODE_ENV !== 'production') globalThis.__openmasjid_pg = client

export const db = drizzle(client, { schema, casing: 'snake_case' })
export type Db = typeof db
/** Either the root db or a transaction handle (`db.transaction(async (tx) => …)`). */
export type DbOrTx = Db | Parameters<Parameters<Db['transaction']>[0]>[0]
export { schema }
