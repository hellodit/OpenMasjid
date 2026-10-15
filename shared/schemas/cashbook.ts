import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { cashAccounts, transactionCategories, transactions } from '../../server/db/schema'
import { isoDate, money, nullableText, pagination, positiveMoney, queryBool, uuid } from './common'

// Base schemas are derived from the Drizzle tables (drizzle-zod), then
// narrowed/refined for the API contract. Shared by API handlers and forms.

const accountBase = createInsertSchema(cashAccounts, {
  name: (s) => s.trim().min(1, 'Nama akun wajib diisi').max(120),
})

export const accountCreateSchema = accountBase
  .pick({ name: true, type: true })
  .extend({
    accountNumber: nullableText(64),
    holderName: nullableText(120),
    openingBalance: money.default('0'),
    sortOrder: z.number().int().min(0).max(9999).default(0),
  })
export type AccountCreateInput = z.input<typeof accountCreateSchema>

export const accountUpdateSchema = accountCreateSchema
  .extend({ isActive: z.boolean() })
  .partial()

export const accountListQuery = z.object({ includeArchived: queryBool.default(false) })

const categoryBase = createInsertSchema(transactionCategories, {
  name: (s) => s.trim().min(1, 'Nama kategori wajib diisi').max(120),
})

export const categoryCreateSchema = categoryBase.pick({ name: true, type: true }).extend({
  parentId: uuid.nullish(),
  slug: z.string().trim().min(1).max(120).optional(),
  icon: nullableText(80),
  colorToken: nullableText(40),
  description: nullableText(500),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})
export type CategoryCreateInput = z.input<typeof categoryCreateSchema>

export const categoryUpdateSchema = categoryCreateSchema
  .omit({ type: true })
  .extend({ isActive: z.boolean() })
  .partial()

export const categoryListQuery = z.object({
  includeArchived: queryBool.default(false),
  type: z.enum(['income', 'expense']).optional(),
})

export const categoryReorderSchema = z.object({
  items: z
    .array(z.object({ id: uuid, sortOrder: z.number().int().min(0).max(9999) }))
    .min(1)
    .max(500),
})

const txBase = createInsertSchema(transactions, {
  description: (s) => s.trim().min(1, 'Deskripsi wajib diisi').max(500),
}).pick({ description: true })

const txCommon = txBase.extend({
  transactionDate: isoDate,
  accountId: uuid,
  amount: positiveMoney,
  referenceNumber: nullableText(80),
  attachmentUrl: z.url().trim().nullish().or(z.literal('').transform(() => null)),
})

export const transactionCreateSchema = z.discriminatedUnion('type', [
  txCommon.extend({ type: z.literal('income'), categoryId: uuid }),
  txCommon.extend({ type: z.literal('expense'), categoryId: uuid }),
  txCommon.extend({ type: z.literal('transfer'), destinationAccountId: uuid }),
])
export type TransactionCreateInput = z.input<typeof transactionCreateSchema>

/** Type is immutable after creation; everything else is optional. */
export const transactionUpdateSchema = txCommon.partial().extend({
  destinationAccountId: uuid.nullish(),
  categoryId: uuid.nullish(),
})

export const transactionListQuery = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  accountId: uuid.optional(),
  categoryId: uuid.optional(),
  q: z.string().trim().min(1).max(100).optional(),
  ...pagination,
})
