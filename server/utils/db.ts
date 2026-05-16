import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

declare global {
  // eslint-disable-next-line no-var
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
    prepare: false,
    max: 1,
  })
}

const client = globalThis.__openmasjid_pg ?? createClient()
if (process.env.NODE_ENV !== 'production') globalThis.__openmasjid_pg = client

export const db = drizzle(client, { schema, casing: 'snake_case' })
export { schema }
