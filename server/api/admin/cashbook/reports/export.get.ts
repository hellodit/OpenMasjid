import { and, asc, eq, gte, isNull, lte } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import {
  cashAccounts,
  transactionCategories,
  transactions,
  users,
} from '~~/server/db/schema'
import { periodQuery } from '#shared/schemas/common'

function csvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  let s = String(val)
  // Neutralise spreadsheet formula injection (=, +, -, @ at the start of text).
  if (typeof val === 'string' && /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const range = resolvePeriod(readZodQuery(event, periodQuery), await getMosqueTimezone())

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
  const csv = '\uFEFF' + lines.join('\r\n')

  setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setHeader(
    event,
    'content-disposition',
    `attachment; filename="buku-kas-${range.from}_${range.to}.csv"`,
  )
  return csv
})
