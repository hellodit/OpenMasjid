import { and, eq, isNull, or, sql } from 'drizzle-orm'
import { cashAccounts, transactions } from '~~/server/db/schema'

/**
 * Accounts with transactions are archived (is_active=false), others are
 * soft-deleted. Either way the balance must be 0 first.
 */
export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)

  const account = await getAccountWithBalance(db, id)
  if (!account) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
  if (Number(account.balance) !== 0)
    throw createError({
      statusCode: 409,
      statusMessage: 'Saldo akun harus 0 sebelum dihapus/diarsipkan. Pindahkan saldo lewat transaksi transfer.',
    })

  const [usage] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(transactions)
    .where(
      and(
        isNull(transactions.deletedAt),
        or(eq(transactions.accountId, id), eq(transactions.destinationAccountId, id)),
      ),
    )

  const where = and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt))
  if ((usage?.count ?? 0) > 0) {
    const [row] = await db
      .update(cashAccounts)
      .set({ isActive: false, updatedBy: user.id })
      .where(where)
      .returning()
    return { archived: true, account: row }
  }

  const [row] = await db
    .update(cashAccounts)
    .set({ deletedAt: new Date(), isActive: false, updatedBy: user.id })
    .where(where)
    .returning()
  return { deleted: true, account: row }
})
