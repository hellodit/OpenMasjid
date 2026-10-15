import { and, eq, isNull } from 'drizzle-orm'
import { createError, type H3Event } from 'h3'
import { db, withTenant } from './db'
import { tenants } from '../db/schema'
import { RESERVED_TENANT_SLUGS } from '../../shared/schemas/tenants'

export const DEFAULT_TIMEZONE = 'Asia/Jakarta'

export interface TenantContext {
  id: string
  slug: string
  name: string
  status: 'active' | 'suspended'
  ownerUserId: string | null
  /** IANA timezone of the mosque (from mosque_profile). */
  timezone: string
}

const TTL_MS = 60_000
const cache = new Map<string, { at: number, value: TenantContext | null }>()

/** Slug → tenant, cached for 60s. `tenants` is a global table (no RLS). */
export async function resolveTenant(slug: string): Promise<TenantContext | null> {
  const hit = cache.get(slug)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value

  const row = await db.query.tenants.findFirst({
    where: and(eq(tenants.slug, slug), isNull(tenants.deletedAt)),
  })
  let value: TenantContext | null = null
  if (row) {
    const profile = await withTenant(row.id, (tx) =>
      tx.query.mosqueProfile.findFirst({ columns: { timezone: true, name: true } }),
    )
    value = {
      id: row.id,
      slug: row.slug,
      name: profile?.name ?? row.name,
      status: row.status,
      ownerUserId: row.ownerUserId,
      timezone: profile?.timezone || DEFAULT_TIMEZONE,
    }
  }
  if (cache.size > 5_000) cache.clear()
  cache.set(slug, { at: Date.now(), value })
  return value
}

export function invalidateTenant(slug: string) {
  cache.delete(slug)
}

/** Tenant resolved from the URL by server/middleware/00.tenant.ts. */
export function requireTenant(event: H3Event): TenantContext {
  const tenant = event.context.tenant
  if (!tenant) throw createError({ statusCode: 404, statusMessage: 'Masjid tidak ditemukan' })
  return tenant
}

/** Slugs that collide with top-level app routes (shared with the onboarding form). */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set(RESERVED_TENANT_SLUGS)
