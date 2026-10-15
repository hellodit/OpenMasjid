import { describe, expect, it } from 'vitest'
import { deriveEventStatus, deriveRegistrantStatus, registrationAvailability } from '../../shared/utils/events'

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

describe('registrationAvailability', () => {
  const e = { status: 'published', startDate: '2026-10-20', endDate: null, capacity: 2, requiresRegistration: true }

  it('open, full, closed, past, not-required', () => {
    expect(registrationAvailability(e, 1, '2026-10-15', true)).toBe('open')
    expect(registrationAvailability(e, 2, '2026-10-15', true)).toBe('full')
    expect(registrationAvailability(e, 0, '2026-10-15', false)).toBe('closed')
    expect(registrationAvailability({ ...e, status: 'draft' }, 0, '2026-10-15', true)).toBe('closed')
    expect(registrationAvailability(e, 0, '2026-10-21', true)).toBe('past')
    expect(registrationAvailability({ ...e, requiresRegistration: false }, 0, '2026-10-15', true)).toBe('not-required')
  })

  it('stays open on the event day itself', () => {
    expect(registrationAvailability(e, 0, '2026-10-20', true)).toBe('open')
  })
})
