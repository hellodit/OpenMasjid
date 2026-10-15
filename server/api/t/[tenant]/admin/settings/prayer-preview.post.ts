import { z } from 'zod'
import { isoDate } from '#shared/schemas/common'
import { mosqueSettingsSchema } from '#shared/schemas/mosque'

const bodySchema = z.object({
  date: isoDate.optional(),
  settings: mosqueSettingsSchema.pick({
    latitude: true,
    longitude: true,
    timezone: true,
    prayerMethod: true,
    asrMadhab: true,
    prayerAdjustments: true,
    iqamahOffsets: true,
  }),
})

/** Preview prayer times for unsaved settings (settings page). */
export default defineTenantHandler('staff', async (event) => {
  const { date, settings } = await readZodBody(event, bodySchema)
  const s = prayerSettingsFrom(null)
  const merged = {
    latitude: settings.latitude ?? s.latitude,
    longitude: settings.longitude ?? s.longitude,
    timezone: settings.timezone,
    method: settings.prayerMethod,
    madhab: settings.asrMadhab,
    adjustments: settings.prayerAdjustments,
    iqamah: settings.iqamahOffsets,
  }
  const day = date ?? dateInTimeZone(merged.timezone)
  return { date: day, hijri: hijriLabel(new Date(`${day}T12:00:00Z`), merged.timezone), prayers: computePrayerTimes(day, merged) }
})
