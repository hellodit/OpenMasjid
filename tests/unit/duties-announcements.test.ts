import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, nextFriday } from '../../shared/utils/duties'
import { announcementVisibility } from '../../shared/utils/announcements'
import { mosqueSlugFromName } from '../../shared/utils/slug'
import { dutyCopySchema, dutyRangeQuery, dutySchema } from '../../shared/schemas/duties'
import { announcementSchema } from '../../shared/schemas/announcements'

describe('duty date helpers', () => {
  it('adds days across month/year boundaries', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(daysBetween('2026-10-15', '2026-10-22')).toBe(7)
  })

  it('finds the next Friday (inclusive)', () => {
    expect(nextFriday('2026-10-15')).toBe('2026-10-16') // Thursday
    expect(nextFriday('2026-10-16')).toBe('2026-10-16') // Friday itself
    expect(nextFriday('2026-10-17')).toBe('2026-10-23') // Saturday
  })
})

describe('duty schemas', () => {
  it('validates an assignment', () => {
    expect(dutySchema.safeParse({ date: '2026-10-16', service: 'jumuah', role: 'khatib', personName: 'Ust. Ahmad' }).success).toBe(true)
    expect(dutySchema.safeParse({ date: '2026-10-16', service: 'brunch', role: 'khatib', personName: 'X Y' }).success).toBe(false)
  })

  it('limits ranges', () => {
    expect(dutyRangeQuery.safeParse({ from: '2026-10-01', to: '2026-10-31' }).success).toBe(true)
    expect(dutyRangeQuery.safeParse({ from: '2026-10-31', to: '2026-10-01' }).success).toBe(false)
    expect(dutyRangeQuery.safeParse({ from: '2026-01-01', to: '2026-12-31' }).success).toBe(false)
    expect(dutyCopySchema.safeParse({ sourceFrom: '2026-10-12', sourceTo: '2026-10-18', targetFrom: '2026-10-12' }).success).toBe(false)
  })
})

describe('announcements', () => {
  const pub = { status: 'published' as const, startsOn: '2026-10-10', endsOn: '2026-10-20' }

  it('derives visibility from status and date window', () => {
    expect(announcementVisibility(pub, '2026-10-15')).toBe('active')
    expect(announcementVisibility(pub, '2026-10-09')).toBe('scheduled')
    expect(announcementVisibility(pub, '2026-10-21')).toBe('expired')
    expect(announcementVisibility({ ...pub, endsOn: null }, '2030-01-01')).toBe('active')
    expect(announcementVisibility({ ...pub, status: 'draft' }, '2026-10-15')).toBe('draft')
  })

  it('rejects an end date before the start date', () => {
    expect(announcementSchema.safeParse({ title: 'Kerja bakti', startsOn: '2026-10-20', endsOn: '2026-10-10' }).success).toBe(false)
    const ok = announcementSchema.parse({ title: 'Kerja bakti', body: '', startsOn: '' })
    expect(ok).toMatchObject({ body: null, startsOn: null, status: 'published', showOnDisplay: true })
  })
})

describe('mosqueSlugFromName', () => {
  it('slugifies names', () => {
    expect(mosqueSlugFromName('Masjid Al-Ikhlas  Bandung')).toBe('masjid-al-ikhlas-bandung')
    expect(mosqueSlugFromName('Masjid Raya Baiturrahmân')).toBe('masjid-raya-baiturrahman')
    expect(mosqueSlugFromName('مسجد')).toBe('')
  })
})
