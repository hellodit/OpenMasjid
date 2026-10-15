import { describe, expect, it } from 'vitest'
import { computePrayerTimes, dateInTimeZone, hijriLabel, PRAYER_KEYS, type PrayerSettings } from '../../shared/utils/prayer'

const jakarta: PrayerSettings = {
  latitude: -6.175392,
  longitude: 106.827153,
  timezone: 'Asia/Jakarta',
  method: 'kemenag',
  madhab: 'shafi',
  adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  iqamah: { fajr: 10, sunrise: 0, dhuhr: 10, asr: 10, maghrib: 5, isha: 10 },
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number) as [number, number]
  return h * 60 + m
}

describe('computePrayerTimes', () => {
  const times = computePrayerTimes('2026-10-15', jakarta)
  const byId = Object.fromEntries(times.map((t) => [t.id, t]))

  it('returns the six times in order with Indonesian labels', () => {
    expect(times.map((t) => t.id)).toEqual([...PRAYER_KEYS])
    expect(byId.fajr!.name).toBe('Subuh')
    for (let i = 1; i < times.length; i++) expect(toMin(times[i]!.time)).toBeGreaterThan(toMin(times[i - 1]!.time))
  })

  it('is plausible for Jakarta (regression snapshot)', () => {
    // Kemenag (20°/18°, +2 min ihtiyat) for Monas, 15 Oct 2026.
    expect(times.map((t) => t.time)).toMatchInlineSnapshot(`
      [
        "04:15",
        "05:30",
        "11:41",
        "14:46",
        "17:48",
        "18:58",
      ]
    `)
  })

  it('applies iqamah offsets (none for sunrise)', () => {
    expect(toMin(byId.fajr!.iq) - toMin(byId.fajr!.time)).toBe(10)
    expect(toMin(byId.maghrib!.iq) - toMin(byId.maghrib!.time)).toBe(5)
    expect(byId.sunrise!.iq).toBe(byId.sunrise!.time)
  })

  it('applies per-prayer minute adjustments', () => {
    const adjusted = computePrayerTimes('2026-10-15', { ...jakarta, adjustments: { ...jakarta.adjustments, maghrib: 3, isha: -2 } })
    const a = Object.fromEntries(adjusted.map((t) => [t.id, t]))
    expect(toMin(a.maghrib!.time) - toMin(byId.maghrib!.time)).toBe(3)
    expect(toMin(a.isha!.time) - toMin(byId.isha!.time)).toBe(-2)
  })

  it('hanafi asr is later than shafi asr', () => {
    const hanafi = computePrayerTimes('2026-10-15', { ...jakarta, madhab: 'hanafi' })
    expect(toMin(hanafi[3]!.time)).toBeGreaterThan(toMin(byId.asr!.time))
  })

  it('formats in the mosque timezone', () => {
    // Same coordinates, WITA (UTC+8) shows one hour later on the clock.
    const wita = computePrayerTimes('2026-10-15', { ...jakarta, timezone: 'Asia/Makassar' })
    expect(toMin(wita[2]!.time) - toMin(byId.dhuhr!.time)).toBe(60)
    expect(wita[2]!.at).toBe(byId.dhuhr!.at)
  })
})

describe('date helpers', () => {
  it('dateInTimeZone', () => {
    expect(dateInTimeZone('Asia/Jakarta', new Date('2026-10-15T17:30:00Z'))).toBe('2026-10-16')
  })

  it('hijriLabel uses the Umm al-Qura calendar', () => {
    expect(hijriLabel(new Date('2026-10-15T12:00:00Z'), 'Asia/Jakarta')).toMatch(/1448 H$/)
  })
})
