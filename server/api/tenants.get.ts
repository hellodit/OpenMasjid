import { and, asc, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import { tenants } from '~~/server/db/schema'
import { tenantSearchQuery } from '#shared/schemas/tenants'

/**
 * Public mosque directory / search (landing page hero search).
 * Only global, non-sensitive tenant fields are exposed: slug, name, city.
 * Results matching the start of the name rank first.
 */
export default defineEventHandler(async (event) => {
  const { q, limit } = readZodQuery(event, tenantSearchQuery)
  setResponseHeader(event, 'cache-control', 'public, max-age=60')

  const term = q ? `%${escapeLike(q)}%` : undefined
  const prefix = q ? `${escapeLike(q.toLowerCase())}%` : undefined

  return db
    .select({ slug: tenants.slug, name: tenants.name, city: tenants.city })
    .from(tenants)
    .where(and(
      eq(tenants.status, 'active'),
      isNull(tenants.deletedAt),
      term ? or(ilike(tenants.name, term), ilike(tenants.city, term), ilike(tenants.slug, term)) : undefined,
    ))
    .orderBy(
      ...(prefix ? [sql`CASE WHEN lower(${tenants.name}) LIKE ${prefix} THEN 0 ELSE 1 END`] : []),
      asc(tenants.name),
    )
    .limit(limit)
})
