import { defineEventHandler, setHeader } from 'h3'
import { and, asc, eq, gte, isNull, lte } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import {
  cashAccounts,
  transactionCategories,
  transactions,
  users,
} from '~~/server/db/schema'
import { resolvePeriod } from '~~/server/utils/period'
import { readZodQuery } from '~~/server/utils/validate'
import { z } from 'zod'

const querySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

function csvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const params = readZodQuery(event, querySchema)
  const range = resolvePeriod(params)

  const destAccount = alias(cashAccounts, 'dest_account')

  const rows = await db
    .select({
      transactionDate: transactions.transactionDate,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      referenceNumber: transactions.referenceNumber,
      accountName: cashAccounts.name,
      destAccountName: destAccount.name,
      categoryName: transactionCategories.name,
      createdByName: users.fullName,
    })
    .from(transactions)
    .leftJoin(cashAccounts, eq(transactions.accountId, cashAccounts.id))
    .leftJoin(destAccount, eq(transactions.destinationAccountId, destAccount.id))
    .leftJoin(
      transactionCategories,
      eq(transactions.categoryId, transactionCategories.id),
    )
    .leftJoin(users, eq(transactions.createdBy, users.id))
    .where(
      and(
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, range.from),
        lte(transactions.transactionDate, range.to),
      ),
    )
    .orderBy(asc(transactions.transactionDate))

  const header = [
    'Tanggal',
    'Tipe',
    'Kategori',
    'Akun',
    'Akun Tujuan',
    'Deskripsi',
    'Nomor Referensi',
    'Nominal',
    'Dicatat oleh',
  ]
  const lines = [header.map(csvCell).join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.transactionDate,
        r.type,
        r.categoryName ?? '',
        r.accountName ?? '',
        r.destAccountName ?? '',
        r.description,
        r.referenceNumber ?? '',
        r.amount,
        r.createdByName ?? '',
      ]
        .map(csvCell)
        .join(','),
    )
  }
  const csv = '﻿' + lines.join('\n')

  setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setHeader(
    event,
    'content-disposition',
    `attachment; filename="buku-kas-${range.from}_${range.to}.csv"`,
  )
  return csv
})
