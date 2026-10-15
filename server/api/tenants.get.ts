import { asc, eq, and, isNull } from 'drizzle-orm'
import { tenants } from '~~/server/db/schema'

/** Public directory of active mosques (global, no tenant data exposed). */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=60')
  return db
    .select({ slug: tenants.slug, name: tenants.name })
    .from(tenants)
    .where(and(eq(tenants.status, 'active'), isNull(tenants.deletedAt)))
    .orderBy(asc(tenants.name))
    .limit(500)
})
