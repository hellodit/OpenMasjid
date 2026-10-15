import { and, eq, isNull } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema'
import { transactionUpdateSchema } from '#shared/schemas/cashbook'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = requireRouterId(event)
  const data = await readZodBody(event, transactionUpdateSchema)

  const current = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), isNull(transactions.deletedAt)),
  })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Transaksi tidak ditemukan' })

  const next = {
    accountId: data.accountId ?? current.accountId,
    destinationAccountId:
      data.destinationAccountId !== undefined ? data.destinationAccountId : current.destinationAccountId,
    categoryId: data.categoryId !== undefined ? data.categoryId : current.categoryId,
  }

  // Shape rules (also enforced by the transactions_transfer_shape CHECK).
  if (current.type === 'transfer') {
    if (!next.destinationAccountId)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan wajib diisi untuk transfer' })
    if (next.destinationAccountId === next.accountId)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan harus berbeda' })
    if (next.categoryId)
      throw createError({ statusCode: 400, statusMessage: 'Transfer tidak boleh punya kategori' })
  } else {
    if (!next.categoryId) throw createError({ statusCode: 400, statusMessage: 'Kategori wajib diisi' })
    if (next.destinationAccountId)
      throw createError({ statusCode: 400, statusMessage: 'Hanya transfer yang punya akun tujuan' })
  }

  // Only references that CHANGE must point at active records — editing the
  // description of an old transaction on an archived account must still work.
  if (next.accountId !== current.accountId) await assertActiveAccount(next.accountId, 'sumber')
  if (next.destinationAccountId && next.destinationAccountId !== current.destinationAccountId)
    await assertActiveAccount(next.destinationAccountId, 'tujuan')
  if (current.type !== 'transfer' && next.categoryId && next.categoryId !== current.categoryId)
    await assertCategoryFor(current.type, next.categoryId)

  const [row] = await db
    .update(transactions)
    .set({
      ...next,
      transactionDate: data.transactionDate ?? current.transactionDate,
      amount: data.amount ?? current.amount,
      description: data.description ?? current.description,
      referenceNumber: data.referenceNumber !== undefined ? data.referenceNumber : current.referenceNumber,
      attachmentUrl: data.attachmentUrl !== undefined ? data.attachmentUrl : current.attachmentUrl,
      updatedBy: user.id,
    })
    .where(eq(transactions.id, id))
    .returning()
  return row
})
