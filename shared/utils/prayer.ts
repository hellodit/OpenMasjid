import { CalculationMethod, Coordinates, Madhab, PrayerTimes, type CalculationParameters } from 'adhan'

export const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
export type PrayerId = (typeof PRAYER_KEYS)[number]
export type PrayerMinuteMap = Record<PrayerId, number>

export const PRAYER_CALC_METHODS = ['kemenag', 'mwl', 'isna', 'egypt', 'makkah', 'karachi', 'singapore'] as const
export type PrayerCalcMethod = (typeof PRAYER_CALC_METHODS)[number]

export const PRAYER_METHOD_LABELS: Record<PrayerCalcMethod, string> = {
  kemenag: 'Kemenag RI (20° / 18°)',
  mwl: 'Muslim World League',
  isna: 'ISNA (Amerika Utara)',
  egypt: 'Egyptian General Authority',
  makkah: 'Umm al-Qura, Makkah',
  karachi: 'University of Karachi',
  singapore: 'MUIS Singapura',
}

export const PRAYER_LABELS: Record<PrayerId, { name: string, ar: string }> = {
  fajr: { name: 'Subuh', ar: 'الفجر' },
  sunrise: { name: 'Terbit', ar: 'الشروق' },
  dhuhr: { name: 'Dzuhur', ar: 'الظهر' },
  asr: { name: 'Ashar', ar: 'العصر' },
  maghrib: { name: 'Maghrib', ar: 'المغرب' },
  isha: { name: 'Isya', ar: 'العشاء' },
}

export interface PrayerSettings {
  latitude: number
  longitude: number
  timezone: string
  method: PrayerCalcMethod
  madhab: 'shafi' | 'hanafi'
  /** Minute corrections added to the calculated adzan time. */
  adjustments: PrayerMinuteMap
  /** Minutes between adzan and iqamah. */
  iqamah: PrayerMinuteMap
}

export interface PrayerTime {
  id: PrayerId
  name: string
  ar: string
  /** Adzan, `HH:MM` in the mosque timezone. */
  time: string
  /** Iqamah, `HH:MM` (equal to `time` for `sunrise`). */
  iq: string
  /** ISO timestamps for countdowns. */
  at: string
  iqAt: string
}

function params(method: PrayerCalcMethod): CalculationParameters {
  switch (method) {
    case 'kemenag': {
      // Kemenag RI: Fajr 20°, Isha 18°, +2 minute ihtiyat on every prayer.
      const p = CalculationMethod.Other()
      p.fajrAngle = 20
      p.ishaAngle = 18
      p.methodAdjustments = { fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 }
      return p
    }
    case 'mwl': return CalculationMethod.MuslimWorldLeague()
    case 'isna': return CalculationMethod.NorthAmerica()
    case 'egypt': return CalculationMethod.Egyptian()
    case 'makkah': return CalculationMethod.UmmAlQura()
    case 'karachi': return CalculationMethod.Karachi()
    case 'singapore': return CalculationMethod.Singapore()
  }
}

function hhmm(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(date)
}

/** Calendar date (YYYY-MM-DD) of `now` in `timeZone`. */
export function dateInTimeZone(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Hijri date label (Umm al-Qura) e.g. "4 Jumadilawal 1448 H". */
export function hijriLabel(date = new Date(), timeZone = 'Asia/Jakarta'): string {
  return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(date)
}

/**
 * Compute the five daily prayers (+ sunrise) for a calendar date
 * (`YYYY-MM-DD`, interpreted in the mosque timezone) using `adhan`.
 */
export function computePrayerTimes(isoDate: string, s: PrayerSettings): PrayerTime[] {
  const [y, m, d] = isoDate.split('-').map(Number) as [number, number, number]
  const p = params(s.method)
  p.madhab = s.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi
  p.adjustments = {
    fajr: s.adjustments.fajr,
    sunrise: s.adjustments.sunrise,
    dhuhr: s.adjustments.dhuhr,
    asr: s.adjustments.asr,
    maghrib: s.adjustments.maghrib,
    isha: s.adjustments.isha,
  }
  // adhan reads the local Y/M/D components of the Date it receives.
  const times = new PrayerTimes(new Coordinates(s.latitude, s.longitude), new Date(y, m - 1, d), p)
  const raw: Record<PrayerId, Date> = {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  }

  return PRAYER_KEYS.map((id) => {
    const at = raw[id]
    const iqMinutes = id === 'sunrise' ? 0 : s.iqamah[id]
    const iqAt = new Date(at.getTime() + iqMinutes * 60_000)
    return {
      id,
      ...PRAYER_LABELS[id],
      time: hhmm(at, s.timezone),
      iq: hhmm(iqAt, s.timezone),
      at: at.toISOString(),
      iqAt: iqAt.toISOString(),
    }
  })
}
