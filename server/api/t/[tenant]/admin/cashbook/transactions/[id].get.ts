import { and, eq, isNull } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema'

const accountCols = { id: true, name: true, type: true } as const
const userCols = { id: true, fullName: true } as const

export default defineTenantHandler('staff', async (event, { db }) => {
  const id = requireRouterId(event)

  const row = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), isNull(transactions.deletedAt)),
    with: {
      account: { columns: accountCols },
      destinationAccount: { columns: accountCols },
      category: { columns: { id: true, name: true, colorToken: true, icon: true } },
      creator: { columns: userCols },
      updater: { columns: userCols },
    },
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })

  const { account, destinationAccount, category, creator, updater, ...transaction } = row
  return {
    transaction,
    account,
    destinationAccount,
    category,
    createdBy: creator,
    updatedBy: updater,
  }
})
