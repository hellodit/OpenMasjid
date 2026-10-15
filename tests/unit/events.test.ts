import { describe, expect, it } from 'vitest'
import { deriveEventStatus, deriveRegistrantStatus } from '../../shared/utils/events'

const ev = (over: Partial<{ status: string, startDate: string, endDate: string | null, capacity: number | null }> = {}) => ({
  status: 'published',
  startDate: '2026-10-20',
  endDate: null,
  capacity: 10,
  ...over,
})

describe('deriveEventStatus', () => {
  it('keeps draft and archived', () => {
    expect(deriveEventStatus(ev({ status: 'draft' }), 99, '2026-10-20')).toBe('draft')
    expect(deriveEventStatus(ev({ status: 'archived' }), 0, '2026-10-20')).toBe('archived')
  })

  it('is ongoing on its dates (even when full)', () => {
    expect(deriveEventStatus(ev(), 10, '2026-10-20')).toBe('ongoing')
    expect(deriveEventStatus(ev({ endDate: '2026-10-22' }), 0, '2026-10-22')).toBe('ongoing')
  })

  it('is full when capacity is reached', () => {
    expect(deriveEventStatus(ev(), 10, '2026-10-01')).toBe('full')
    expect(deriveEventStatus(ev(), 9, '2026-10-01')).toBe('published')
  })

  it('without capacity is never full', () => {
    expect(deriveEventStatus(ev({ capacity: null }), 5000, '2026-10-01')).toBe('published')
  })
})

describe('deriveRegistrantStatus', () => {
  it('cancelled wins over attended', () => {
    expect(deriveRegistrantStatus({ attendedAt: new Date(), cancelledAt: new Date() })).toBe('cancelled')
    expect(deriveRegistrantStatus({ attendedAt: '2026-10-20T10:00:00Z', cancelledAt: null })).toBe('attended')
    expect(deriveRegistrantStatus({ attendedAt: null, cancelledAt: null })).toBe('confirmed')
  })
})
