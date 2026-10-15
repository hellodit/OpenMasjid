import { pgEnum } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['admin', 'viewer', 'jamaah'])

export const eventStatus = pgEnum('event_status', [
  'draft',
  'published',
  'ongoing',
  'full',
  'archived',
])

export const registrantSource = pgEnum('registrant_source', [
  'web',
  'qr',
  'admin',
])

export const transactionType = pgEnum('transaction_type', [
  'income',
  'expense',
  'transfer',
])

export const cashAccountType = pgEnum('cash_account_type', [
  'cash',
  'bank',
  'ewallet',
])

export const transactionCategoryType = pgEnum('transaction_category_type', [
  'income',
  'expense',
])

/** Maps 1:1 to `adhan.CalculationMethod.*` (see shared/utils/prayer.ts). */
export const prayerCalcMethod = pgEnum('prayer_calc_method', [
  'kemenag',
  'mwl',
  'isna',
  'egypt',
  'makkah',
  'karachi',
  'singapore',
])

export const asrMadhab = pgEnum('asr_madhab', ['shafi', 'hanafi'])

export const tenantStatus = pgEnum('tenant_status', ['active', 'suspended'])
