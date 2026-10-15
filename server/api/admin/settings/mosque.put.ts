import { MOSQUE_PROFILE_SINGLETON_ID, mosqueProfile } from '~~/server/db/schema'
import { mosqueSettingsSchema } from '#shared/schemas/mosque'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const data = await readZodBody(event, mosqueSettingsSchema)
  const values = {
    ...data,
    latitude: data.latitude != null ? data.latitude.toFixed(6) : null,
    longitude: data.longitude != null ? data.longitude.toFixed(6) : null,
    updatedBy: user.id,
  }
  const [row] = await db
    .insert(mosqueProfile)
    .values({ id: MOSQUE_PROFILE_SINGLETON_ID, ...values })
    .onConflictDoUpdate({ target: mosqueProfile.id, set: values })
    .returning()
  return row
})
