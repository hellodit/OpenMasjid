import { eq } from 'drizzle-orm'
import { mosqueProfile, tenants } from '~~/server/db/schema'
import { mosqueSetupSchema } from '#shared/schemas/mosque'

/** Save one wizard step (partial) and/or mark setup finished. */
export default defineTenantHandler('admin', async (event, { db, tenant, user }) => {
  const { complete, latitude, longitude, ...rest } = await readZodBody(event, mosqueSetupSchema)

  const values: Partial<typeof mosqueProfile.$inferInsert> = { ...rest, updatedBy: user.id }
  if (latitude !== undefined) values.latitude = latitude != null ? latitude.toFixed(6) : null
  if (longitude !== undefined) values.longitude = longitude != null ? longitude.toFixed(6) : null
  if (complete) values.setupCompletedAt = new Date()

  const [row] = await db.update(mosqueProfile).set(values).where(eq(mosqueProfile.tenantId, tenant.id)).returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Profil masjid belum diatur' })

  if (rest.city !== undefined) await db.update(tenants).set({ city: rest.city }).where(eq(tenants.id, tenant.id))
  if (rest.timezone !== undefined) invalidateTenant(tenant.slug)
  return { ok: true, completedAt: row.setupCompletedAt }
})
