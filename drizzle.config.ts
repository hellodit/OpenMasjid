import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_DIRECT_URL
if (!url) {
  throw new Error(
    'DATABASE_DIRECT_URL is not set. drizzle-kit needs the Supabase direct (5432) connection — see .env.example.',
  )
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema/*',
  out: './server/db/migrations',
  casing: 'snake_case',
  dbCredentials: { url },
  strict: true,
  verbose: true,
})
