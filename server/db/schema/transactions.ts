import { sql } from 'drizzle-orm'
import {
  check,
  foreignKey,
  date,
  index,
  numeric,
  pgTable,
  text,
  uuid,
} from 'drizzle-orm/pg-core'
import { cashAccounts } from './cashAccounts'
import { transactionCategories } from './transactionCategories'
import { users } from './users'
import { transactionType } from './_enums'
import { timestamps } from './_columns'

import { tenantIdColumn, tenantIsolationPolicy } from './tenants'
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: tenantIdColumn(),
    type: transactionType('type').notNull(),
    transactionDate: date('transaction_date').notNull(),
    accountId: uuid('account_id').notNull(),
    destinationAccountId: uuid('destination_account_id'),
    categoryId: uuid('category_id'),
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
    ...timestamps,
  },
  (t) => [
    tenantIsolationPolicy('transactions', t.tenantId),
    // Composite FKs: referenced rows must belong to the SAME tenant
    // (FK checks bypass RLS, so this is the database-level guarantee).
    foreignKey({
      name: 'transactions_account_fk',
      columns: [t.tenantId, t.accountId],
      foreignColumns: [cashAccounts.tenantId, cashAccounts.id],
    }).onDelete('restrict'),
    foreignKey({
      name: 'transactions_destination_account_fk',
      columns: [t.tenantId, t.destinationAccountId],
      foreignColumns: [cashAccounts.tenantId, cashAccounts.id],
    }).onDelete('restrict'),
    foreignKey({
      name: 'transactions_category_fk',
      columns: [t.tenantId, t.categoryId],
      foreignColumns: [transactionCategories.tenantId, transactionCategories.id],
    }).onDelete('restrict'),
    index('transactions_tenant_date_idx')
      .on(t.tenantId, t.transactionDate.desc())
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
