import { describe, expect, it } from 'vitest'
import { resolvePeriod, todayIn } from '../../server/utils/period'

describe('todayIn', () => {
  it('uses the mosque timezone, not UTC', () => {
    // 20:00 UTC on Oct 15 is already Oct 16 in Jakarta (UTC+7).
    const instant = new Date('2026-10-15T20:00:00Z')
    expect(todayIn('UTC', instant)).toBe('2026-10-15')
    expect(todayIn('Asia/Jakarta', instant)).toBe('2026-10-16')
    expect(todayIn('Asia/Jayapura', new Date('2026-10-15T14:59:00Z'))).toBe('2026-10-15')
    expect(todayIn('Asia/Jayapura', new Date('2026-10-15T15:00:00Z'))).toBe('2026-10-16')
  })
})

describe('resolvePeriod', () => {
  const tz = 'Asia/Jakarta'

  it('day', () => {
    expect(resolvePeriod({ period: 'day', date: '2026-10-15' }, tz)).toEqual({ from: '2026-10-15', to: '2026-10-15' })
  })

  it('week runs Monday to Sunday', () => {
    // 2026-10-15 is a Thursday.
    expect(resolvePeriod({ period: 'week', date: '2026-10-15' }, tz)).toEqual({ from: '2026-10-12', to: '2026-10-18' })
    // Sunday belongs to the week that started the Monday before.
    expect(resolvePeriod({ period: 'week', date: '2026-10-18' }, tz)).toEqual({ from: '2026-10-12', to: '2026-10-18' })
  })

  it('month handles month lengths and leap years', () => {
    expect(resolvePeriod({ period: 'month', date: '2026-02-10' }, tz)).toEqual({ from: '2026-02-01', to: '2026-02-28' })
    expect(resolvePeriod({ period: 'month', date: '2028-02-10' }, tz)).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(resolvePeriod({ period: 'month', date: '2026-12-31' }, tz)).toEqual({ from: '2026-12-01', to: '2026-12-31' })
  })

  it('year', () => {
    expect(resolvePeriod({ period: 'year', date: '2026-06-01' }, tz)).toEqual({ from: '2026-01-01', to: '2026-12-31' })
  })

  it('explicit range wins and is validated', () => {
    expect(resolvePeriod({ from: '2026-01-01', to: '2026-03-31', period: 'day' }, tz)).toEqual({ from: '2026-01-01', to: '2026-03-31' })
    expect(() => resolvePeriod({ from: '2026-03-01', to: '2026-01-01' }, tz)).toThrow()
  })

  it('rejects unknown periods', () => {
    expect(() => resolvePeriod({ period: 'decade', date: '2026-01-01' }, tz)).toThrow()
  })
})
