import { sql } from 'drizzle-orm'
import {
  check,
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { cashAccounts } from './cashAccounts'
import { transactionCategories } from './transactionCategories'
import { users } from './users'
import { transactionType } from './_enums'

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: transactionType('type').notNull(),
    transactionDate: date('transaction_date').notNull(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => cashAccounts.id, { onDelete: 'restrict' }),
    destinationAccountId: uuid('destination_account_id').references(
      () => cashAccounts.id,
      { onDelete: 'restrict' },
    ),
    categoryId: uuid('category_id').references(
      () => transactionCategories.id,
      { onDelete: 'restrict' },
    ),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    description: text('description').notNull(),
    referenceNumber: text('reference_number'),
    attachmentUrl: text('attachment_url'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    updatedBy: uuid('updated_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('transactions_date_idx')
      .on(t.transactionDate.desc())
      .where(sql`${t.deletedAt} IS NULL`),
    index('transactions_account_date_idx')
      .on(t.accountId, t.transactionDate.desc())
      .where(sql`${t.deletedAt} IS NULL`),
    index('transactions_category_date_idx')
      .on(t.categoryId, t.transactionDate.desc())
      .where(sql`${t.deletedAt} IS NULL`),
    index('transactions_destination_idx')
      .on(t.destinationAccountId)
      .where(sql`${t.destinationAccountId} IS NOT NULL`),
    check('transactions_amount_positive', sql`${t.amount} > 0`),
    check(
      'transactions_transfer_shape',
      sql`(${t.type} = 'transfer' AND ${t.destinationAccountId} IS NOT NULL AND ${t.destinationAccountId} <> ${t.accountId} AND ${t.categoryId} IS NULL) OR (${t.type} IN ('income','expense') AND ${t.destinationAccountId} IS NULL AND ${t.categoryId} IS NOT NULL)`,
    ),
  ],
)
