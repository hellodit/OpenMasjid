/**
 * Resolve the tenant (mosque) for tenant-scoped API routes:
 *   /api/t/<slug>/…   → event.context.tenant
 * Pages are resolved client-side from the `[tenant]` route param and always
 * talk to these API routes, so this is the single entry point.
 */
const TENANT_API = /^\/api\/t\/([a-z0-9-]+)(?:\/|$)/

export default defineEventHandler(async (event) => {
  const match = TENANT_API.exec(event.path)
  if (!match) return

  const tenant = await resolveTenant(match[1]!)
  if (!tenant) throw createError({ statusCode: 404, statusMessage: 'Masjid tidak ditemukan' })
  if (tenant.status === 'suspended')
    throw createError({ statusCode: 403, statusMessage: 'Masjid ini sedang dinonaktifkan' })
  event.context.tenant = tenant
})
