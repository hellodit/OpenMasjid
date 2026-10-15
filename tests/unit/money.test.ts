import { describe, expect, it } from 'vitest'
import { subMoney, sumMoney } from '../../shared/utils/money'

describe('sumMoney', () => {
  it('adds decimal strings without float drift', () => {
    expect(sumMoney(['0.10', '0.20'])).toBe('0.30')
    expect(sumMoney(['1000000.05', '2500000', '0.95'])).toBe('3500001.00')
  })

  it('ignores null, undefined and empty values', () => {
    expect(sumMoney([null, undefined, '', '5'])).toBe('5.00')
    expect(sumMoney([])).toBe('0.00')
  })

  it('handles negatives and numbers', () => {
    expect(sumMoney(['-10.50', 4])).toBe('-6.50')
  })

  it('stays exact for large balances (numeric(14,2))', () => {
    expect(sumMoney(['999999999999.99', '0.01'])).toBe('1000000000000.00')
  })
})

describe('subMoney', () => {
  it('subtracts exactly', () => {
    expect(subMoney('28328796.00', '8303350.00')).toBe('20025446.00')
    expect(subMoney('0.30', '0.10')).toBe('0.20')
  })

  it('goes negative', () => {
    expect(subMoney('100', '250.75')).toBe('-150.75')
  })
})
