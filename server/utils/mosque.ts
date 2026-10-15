import type { DbOrTx } from './db'
import type { TenantContext } from './tenant'
import { computePrayerTimes, dateInTimeZone, hijriLabel, type PrayerSettings } from '../../shared/utils/prayer'

/** The current tenant's mosque profile (RLS-scoped: pass the tenant `db`). */
export async function getMosqueProfile(db: DbOrTx) {
  return (await db.query.mosqueProfile.findFirst()) ?? null
}
// Monas, Jakarta — used until the mosque coordinates are configured.
const FALLBACK_COORDS = { latitude: -6.175392, longitude: 106.827153 }

type ProfileRow = NonNullable<Awaited<ReturnType<typeof getMosqueProfile>>>

export function prayerSettingsFrom(row: ProfileRow | null): PrayerSettings {
  return {
    latitude: row?.latitude != null ? Number(row.latitude) : FALLBACK_COORDS.latitude,
    longitude: row?.longitude != null ? Number(row.longitude) : FALLBACK_COORDS.longitude,
    timezone: row?.timezone || 'Asia/Jakarta',
    method: row?.prayerMethod ?? 'kemenag',
    madhab: row?.asrMadhab ?? 'shafi',
    adjustments: row?.prayerAdjustments ?? { subuh: 0, terbit: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 },
    iqamah: row?.iqamahOffsets ?? { subuh: 10, terbit: 0, dzuhur: 10, ashar: 10, maghrib: 5, isya: 10 },
  }
}

/** Prayer schedule for a mosque-local date (defaults to today). */
export async function getPrayerSchedule(db: DbOrTx, tenant: Pick<TenantContext, 'timezone'>, date?: string) {
  const profile = await getMosqueProfile(db)
  const settings = prayerSettingsFrom(profile)
  const day = date ?? dateInTimeZone(settings.timezone || tenant.timezone)
  return {
    date: day,
    timezone: settings.timezone,
    hijri: hijriLabel(new Date(`${day}T12:00:00Z`), settings.timezone),
    method: settings.method,
    coordinatesConfigured: profile?.latitude != null && profile?.longitude != null,
    prayers: computePrayerTimes(day, settings),
  }
}
