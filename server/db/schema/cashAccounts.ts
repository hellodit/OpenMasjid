import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { cashAccountType } from './_enums'

export const cashAccounts = pgTable(
  'cash_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    type: cashAccountType('type').notNull(),
    accountNumber: text('account_number'),
    holderName: text('holder_name'),
    openingBalance: numeric('opening_balance', { precision: 14, scale: 2 })
      .notNull()
      .default('0'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('cash_accounts_active_sort_idx')
      .on(t.isActive, t.sortOrder)
      .where(sql`${t.deletedAt} IS NULL`),
    check(
      'cash_accounts_opening_balance_non_negative',
      sql`${t.openingBalance} >= 0`,
    ),
  ],
)
