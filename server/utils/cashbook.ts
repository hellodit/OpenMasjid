import { createError } from 'h3'
import { and, eq, isNull } from 'drizzle-orm'
import type { DbOrTx } from './db'
import { cashAccounts, transactionCategories } from '../db/schema'

/** Account must exist and be active to receive NEW money movements. */
export async function assertActiveAccount(db: DbOrTx, id: string, label: 'sumber' | 'tujuan') {
  const row = await db.query.cashAccounts.findFirst({
    where: and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt)),
    columns: { id: true, isActive: true },
  })
  if (!row) throw createError({ statusCode: 400, statusMessage: `Akun ${label} tidak ditemukan` })
  if (!row.isActive) throw createError({ statusCode: 400, statusMessage: `Akun ${label} sudah diarsipkan` })
}

/** Category must exist, be active, and match the transaction type. */
export async function assertCategoryFor(db: DbOrTx, type: 'income' | 'expense', id: string) {
  const row = await db.query.transactionCategories.findFirst({
    where: and(eq(transactionCategories.id, id), isNull(transactionCategories.deletedAt)),
    columns: { id: true, type: true, isActive: true },
  })
  if (!row) throw createError({ statusCode: 400, statusMessage: 'Kategori tidak ditemukan' })
  if (!row.isActive) throw createError({ statusCode: 400, statusMessage: 'Kategori sudah diarsipkan' })
  if (row.type !== type)
    throw createError({
      statusCode: 400,
      statusMessage: `Kategori tidak cocok untuk ${type === 'income' ? 'pemasukan' : 'pengeluaran'}`,
    })
}
