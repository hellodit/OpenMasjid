import { eq } from 'drizzle-orm'
import { mosqueProfile, tenants } from '~~/server/db/schema'
import { mosqueSettingsSchema } from '#shared/schemas/mosque'

export default defineTenantHandler('admin', async (event, { db, tenant, user }) => {
  const data = await readZodBody(event, mosqueSettingsSchema)
  const values = {
    ...data,
    latitude: data.latitude != null ? data.latitude.toFixed(6) : null,
    longitude: data.longitude != null ? data.longitude.toFixed(6) : null,
    updatedBy: user.id,
  }
  // tenant_id defaults to the transaction's app.tenant_id (one profile per tenant).
  const [row] = await db
    .insert(mosqueProfile)
    .values(values)
    .onConflictDoUpdate({ target: mosqueProfile.tenantId, set: values })
    .returning()

  // Keep the public directory (name, city) in sync and drop the cached timezone/name.
  await db.update(tenants).set({ name: data.name, city: data.city ?? null }).where(eq(tenants.id, tenant.id))
  invalidateTenant(tenant.slug)
  return row
})
