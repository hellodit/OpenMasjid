import { createError, defineEventHandler, getRouterParam } from 'h3'
import { and, eq, isNull } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { requireAdmin } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import {
  cashAccounts,
  transactionCategories,
  transactions,
  users,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const destAccount = alias(cashAccounts, 'dest_account')
  const updater = alias(users, 'updater')

  const rows = await db
    .select({
      transaction: transactions,
      account: { id: cashAccounts.id, name: cashAccounts.name, type: cashAccounts.type },
      destinationAccount: {
        id: destAccount.id,
        name: destAccount.name,
        type: destAccount.type,
      },
      category: {
        id: transactionCategories.id,
        name: transactionCategories.name,
        colorToken: transactionCategories.colorToken,
        icon: transactionCategories.icon,
      },
      createdBy: { id: users.id, fullName: users.fullName },
      updatedBy: { id: updater.id, fullName: updater.fullName },
    })
    .from(transactions)
    .leftJoin(cashAccounts, eq(transactions.accountId, cashAccounts.id))
    .leftJoin(destAccount, eq(transactions.destinationAccountId, destAccount.id))
    .leftJoin(
      transactionCategories,
      eq(transactions.categoryId, transactionCategories.id),
    )
    .leftJoin(users, eq(transactions.createdBy, users.id))
    .leftJoin(updater, eq(transactions.updatedBy, updater.id))
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
    .limit(1)

  if (!rows.length)
    throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })
  return rows[0]
})
