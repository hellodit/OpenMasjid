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
