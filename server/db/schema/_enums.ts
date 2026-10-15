import { pgEnum } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['admin', 'viewer', 'member'])

/** Persisted event status; `ongoing` / `full` are derived (shared/utils/events.ts). */
export const eventStatus = pgEnum('event_status', ['draft', 'published', 'archived'])

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

export const announcementStatus = pgEnum('announcement_status', ['draft', 'published', 'archived'])

/** Which prayer/service a duty assignment belongs to. */
export const dutyService = pgEnum('duty_service', [
  'jumuah',
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
  'tarawih',
  'eid',
  'other',
])

/** Role of the person on duty (imam, khatib, ...). */
export const dutyRole = pgEnum('duty_role', ['imam', 'khatib', 'muadzin', 'bilal', 'preacher', 'other'])
