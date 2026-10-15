import { describe, expect, it } from 'vitest'
import { onboardingSchema, tenantSlug } from '../../shared/schemas/tenants'
import { transactionCreateSchema } from '../../shared/schemas/cashbook'
import { eventCreateSchema } from '../../shared/schemas/events'

describe('tenantSlug', () => {
  it('normalizes and accepts valid slugs', () => {
    expect(tenantSlug.parse('  Al-Hikmah ')).toBe('al-hikmah')
  })

  it('rejects reserved and malformed slugs', () => {
    for (const bad of ['admin', 'register', 'api', '-abc', 'abc-', 'a', 'masjid kita', 'x'.repeat(49)])
      expect(tenantSlug.safeParse(bad).success, bad).toBe(false)
  })

  it('onboarding requires an 8+ char password', () => {
    const base = {
      mosque: { name: 'Masjid Uji', slug: '' },
      owner: { name: 'Owner', email: 'OWNER@Example.com', password: 'short' },
    }
    expect(onboardingSchema.safeParse(base).success).toBe(false)
    const ok = onboardingSchema.parse({ ...base, owner: { ...base.owner, password: 'password123' } })
    expect(ok.owner.email).toBe('owner@example.com')
    expect(ok.mosque.slug).toBeUndefined() // empty slug → generated server-side
  })

  it('onboarding needs only mosque name + owner account', () => {
    const ok = onboardingSchema.safeParse({
      mosque: { name: 'Masjid Al-Ikhlas' },
      owner: { name: 'Fulan', email: 'fulan@example.com', password: 'password123' },
    })
    expect(ok.success).toBe(true)
  })
})

describe('transactionCreateSchema', () => {
  const common = {
    transactionDate: '2026-10-15',
    accountId: '7dd32dfe-4384-4760-be1f-153b006a40b2',
    amount: '1500.50',
    description: 'Infaq',
  }

  it('income needs a category; transfer needs a destination', () => {
    expect(transactionCreateSchema.safeParse({ ...common, type: 'income' }).success).toBe(false)
    expect(transactionCreateSchema.safeParse({ ...common, type: 'transfer' }).success).toBe(false)
    expect(transactionCreateSchema.safeParse({
      ...common, type: 'transfer', destinationAccountId: '1a486a20-085a-4387-9822-bd26ad6d1c37',
    }).success).toBe(true)
  })

  it('validates money', () => {
    const cat = { type: 'income', categoryId: 'de105adf-145e-4c0a-9c49-394d78e4f1ce' }
    for (const amount of ['0', '-5', '1.234', 'abc'])
      expect(transactionCreateSchema.safeParse({ ...common, ...cat, amount }).success, amount).toBe(false)
    expect(transactionCreateSchema.parse({ ...common, ...cat, amount: 2500 }).amount).toBe('2500')
  })
})

describe('eventCreateSchema', () => {
  const base = { title: 'Kajian Rutin', categoryId: '4bb60fe2-9680-441f-aad5-8c729f81f035', startDate: '2026-10-20' }

  it('end date must not be before start date', () => {
    expect(eventCreateSchema.safeParse({ ...base, endDate: '2026-10-19' }).success).toBe(false)
    expect(eventCreateSchema.safeParse({ ...base, endDate: '2026-10-21' }).success).toBe(true)
  })

  it('livestream requires a URL', () => {
    expect(eventCreateSchema.safeParse({ ...base, isLivestream: true }).success).toBe(false)
    expect(eventCreateSchema.safeParse({ ...base, isLivestream: true, livestreamUrl: 'https://youtu.be/x' }).success).toBe(true)
  })
})
