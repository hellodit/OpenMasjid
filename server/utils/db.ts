import { sql } from 'drizzle-orm'
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

/**
 * Run `fn` in a transaction scoped to one tenant. `app.tenant_id` is set with
 * `set_config(..., true)` (transaction-local), which is safe behind the
 * Supabase transaction pooler. Row Level Security policies read it, and
 * `tenant_id` columns default to it — so every tenant query MUST go through here.
 */
export function withTenant<T>(tenantId: string, fn: (tx: DbOrTx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`)
    return fn(tx)
  })
}
