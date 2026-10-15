import { and, eq, isNull } from 'drizzle-orm'
import { cashAccounts } from '~~/server/db/schema'
import { accountUpdateSchema } from '#shared/schemas/cashbook'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)
  const data = await readZodBody(event, accountUpdateSchema)

  // Archiving must not hide money from the books.
  if (data.isActive === false) {
    const current = await getAccountWithBalance(db, id)
    if (current?.isActive && Number(current.balance) !== 0)
      throw createError({
        statusCode: 409,
        statusMessage: 'Saldo akun harus 0 sebelum diarsipkan. Pindahkan saldo lewat transaksi transfer.',
      })
  }

  const [row] = await db
    .update(cashAccounts)
    .set({ ...data, updatedBy: user.id })
    .where(and(eq(cashAccounts.id, id), isNull(cashAccounts.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
  return row
})
