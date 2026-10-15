import { eq, inArray } from 'drizzle-orm'
import { tenants } from '~~/server/db/schema'
import { onboardingSchema, tenantSlug } from '#shared/schemas/tenants'

/**
 * First free slug for a mosque name: base, base-2, base-3, … Names that do not
 * slugify to a valid address (e.g. Arabic script only) get a random one.
 */
async function generateSlug(name: string): Promise<string> {
  let base = mosqueSlugFromName(name)
  if (!tenantSlug.safeParse(base).success) base = `masjid-${base || crypto.randomUUID().slice(0, 6)}`.slice(0, 44)
  const candidates = [base, ...Array.from({ length: 19 }, (_, i) => `${base}-${i + 2}`)]
    .filter((s) => tenantSlug.safeParse(s).success)
  const taken = new Set(
    (await db.select({ slug: tenants.slug }).from(tenants).where(inArray(tenants.slug, candidates))).map((r) => r.slug),
  )
  return candidates.find((s) => !taken.has(s)) ?? `${base}-${crypto.randomUUID().slice(0, 6)}`
}

/**
 * Self-service: create a mosque (tenant) and its owner account, then sign the
 * owner in (session cookie for that tenant is set on the response). Location,
 * timezone and contact details come later in /<slug>/admin/setup.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'onboarding', 5, 60 * 60_000)
  const { mosque, owner } = await readZodBody(event, onboardingSchema)

  let slug = mosque.slug
  if (slug) {
    const taken = await db.query.tenants.findFirst({ where: eq(tenants.slug, slug), columns: { id: true } })
    if (taken) throw createError({ statusCode: 409, statusMessage: 'Alamat masjid sudah dipakai' })
  }
  else {
    slug = await generateSlug(mosque.name)
  }

  const tenant = await provisionTenant({ slug, name: mosque.name, timezone: DEFAULT_TIMEZONE })

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
  return { slug: tenant.slug, redirectTo: `/${tenant.slug}/admin/setup` }
})
