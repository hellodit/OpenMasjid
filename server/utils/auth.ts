import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createError, getCookie, getRequestHeader, type H3Event } from 'h3'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from './db'
import { users } from '../db/schema'

declare global {
  // eslint-disable-next-line no-var
  var __openmasjid_supabase: SupabaseClient | undefined
}

function getSupabase(): SupabaseClient {
  if (globalThis.__openmasjid_supabase) return globalThis.__openmasjid_supabase
  const url = process.env.SUPABASE_URL ?? process.env.NUXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL / SUPABASE_ANON_KEY missing — see .env.example.',
    )
  }
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  if (process.env.NODE_ENV !== 'production')
    globalThis.__openmasjid_supabase = client
  return client
}

function extractToken(event: H3Event): string | null {
  const header = getRequestHeader(event, 'authorization')
  if (header?.toLowerCase().startsWith('bearer ')) return header.slice(7).trim()
  const cookie =
    getCookie(event, 'sb-access-token') ?? getCookie(event, 'supabase-auth-token')
  if (cookie) {
    try {
      const parsed: unknown = JSON.parse(cookie)
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') return parsed[0]
      if (
        parsed &&
        typeof parsed === 'object' &&
        'access_token' in parsed &&
        typeof (parsed as { access_token: unknown }).access_token === 'string'
      ) {
        return (parsed as { access_token: string }).access_token
      }
    } catch {
      return cookie
    }
  }
  return null
}

export interface AuthUser {
  id: string
  email: string | null
  role: 'admin' | 'viewer' | 'jamaah'
}

function isDevBypass(): boolean {
  return process.env.DEV_BYPASS_AUTH === '1' || process.env.DEV_BYPASS_AUTH === 'true'
}

async function getDevUser(): Promise<AuthUser> {
  const envId = process.env.ADMIN_USER_ID
  if (envId) {
    const row = await db.query.users.findFirst({
      where: and(eq(users.id, envId), isNull(users.deletedAt)),
      columns: { id: true, email: true, role: true },
    })
    if (row) return { id: row.id, email: row.email, role: row.role }
  }
  const fallback = await db.query.users.findFirst({
    where: isNull(users.deletedAt),
    orderBy: [desc(users.role), desc(users.createdAt)],
    columns: { id: true, email: true, role: true },
  })
  if (!fallback)
    throw createError({
      statusCode: 500,
      statusMessage:
        'DEV_BYPASS_AUTH aktif tapi tidak ada user di DB. Buat user lewat Supabase Auth dulu, atau set ADMIN_USER_ID.',
    })
  return { id: fallback.id, email: fallback.email, role: fallback.role }
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
  if (isDevBypass()) return getDevUser()

  const token = extractToken(event)
  if (!token)
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })

  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user)
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })

  const row = await db.query.users.findFirst({
    where: eq(users.id, data.user.id),
    columns: { id: true, email: true, role: true, isActive: true, deletedAt: true },
  })
  if (!row || !row.isActive || row.deletedAt)
    throw createError({ statusCode: 401, statusMessage: 'User not found or inactive' })

  return { id: row.id, email: row.email, role: row.role }
}

export async function requireAdmin(event: H3Event): Promise<AuthUser> {
  if (isDevBypass()) return getDevUser()
  const user = await requireAuth(event)
  if (user.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  return user
}
