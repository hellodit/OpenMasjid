import { eq } from 'drizzle-orm'
import { tenants } from '~~/server/db/schema'
import { onboardingSchema } from '#shared/schemas/tenants'

/**
 * Self-service: create a mosque (tenant) and its owner account, then sign the
 * owner in (session cookie for that tenant is set on the response).
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'onboarding', 5, 60 * 60_000)
  const { mosque, owner } = await readZodBody(event, onboardingSchema)

  const taken = await db.query.tenants.findFirst({ where: eq(tenants.slug, mosque.slug), columns: { id: true } })
  if (taken) throw createError({ statusCode: 409, statusMessage: 'Alamat masjid sudah dipakai' })

  const tenant = await provisionTenant({
    slug: mosque.slug,
    name: mosque.name,
    city: mosque.city,
    timezone: mosque.timezone,
  })

  try {
    const userId = await createStaffUser(tenant, owner, 'admin')
    await db.update(tenants).set({ ownerUserId: userId }).where(eq(tenants.id, tenant.id))
  }
  catch (err) {
    await destroyTenant(tenant.id)
    throw err
  }
  invalidateTenant(tenant.slug)

  const res = await getTenantAuth(tenant).api.signInEmail({
    body: { email: owner.email, password: owner.password },
    asResponse: true,
  })
  forwardSetCookies(event, res)

  setResponseStatus(event, 201)
  return { slug: tenant.slug, redirectTo: `/${tenant.slug}/admin` }
})
