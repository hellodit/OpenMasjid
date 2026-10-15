/** Duty roster (jadwal petugas) vocabulary shared by server and UI. */

export const DUTY_SERVICES = ['jumuah', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tarawih', 'eid', 'other'] as const
export type DutyService = typeof DUTY_SERVICES[number]

export const DUTY_ROLES = ['imam', 'khatib', 'muadzin', 'bilal', 'preacher', 'other'] as const
export type DutyRole = typeof DUTY_ROLES[number]

export const DUTY_SERVICE_LABELS: Record<DutyService, string> = {
  jumuah: "Sholat Jum'at",
  fajr: 'Subuh',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya',
  tarawih: 'Tarawih',
  eid: 'Sholat Ied',
  other: 'Lainnya',
}

export const DUTY_ROLE_LABELS: Record<DutyRole, string> = {
  imam: 'Imam',
  khatib: 'Khatib',
  muadzin: 'Muadzin',
  bilal: 'Bilal',
  preacher: 'Penceramah',
  other: 'Petugas lain',
}

/** Roles suggested when filling a service (UI order). */
export const DUTY_ROLES_BY_SERVICE: Record<DutyService, DutyRole[]> = {
  jumuah: ['khatib', 'imam', 'muadzin', 'bilal'],
  fajr: ['imam', 'muadzin', 'preacher'],
  dhuhr: ['imam', 'muadzin'],
  asr: ['imam', 'muadzin'],
  maghrib: ['imam', 'muadzin', 'preacher'],
  isha: ['imam', 'muadzin'],
  tarawih: ['imam', 'preacher', 'bilal'],
  eid: ['khatib', 'imam'],
  other: ['other'],
}

/** Display order of services within a day. */
export const DUTY_SERVICE_ORDER: Record<DutyService, number> = {
  fajr: 1, jumuah: 2, dhuhr: 3, asr: 4, maghrib: 5, isha: 6, tarawih: 7, eid: 0, other: 8,
}

/** `YYYY-MM-DD` + n days (calendar arithmetic, timezone-free). */
export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Whole days from `a` to `b` (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

/** Next Friday on or after `date` (for "Jum'at ini"). */
export function nextFriday(date: string): string {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay()
  return addDays(date, (5 - dow + 7) % 7)
}
