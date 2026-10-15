import { transactions } from '~~/server/db/schema'
import { transactionCreateSchema } from '#shared/schemas/cashbook'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const data = await readZodBody(event, transactionCreateSchema)

  await assertActiveAccount(db, data.accountId, 'sumber')
  if (data.type === 'transfer') {
    if (data.destinationAccountId === data.accountId)
      throw createError({ statusCode: 400, statusMessage: 'Akun tujuan harus berbeda' })
    await assertActiveAccount(db, data.destinationAccountId, 'tujuan')
  } else {
    await assertCategoryFor(db, data.type, data.categoryId)
  }

  const [row] = await db
    .insert(transactions)
    .values({
      type: data.type,
      transactionDate: data.transactionDate,
      accountId: data.accountId,
      destinationAccountId: data.type === 'transfer' ? data.destinationAccountId : null,
      categoryId: data.type === 'transfer' ? null : data.categoryId,
      amount: data.amount,
      description: data.description,
      referenceNumber: data.referenceNumber ?? null,
      attachmentUrl: data.attachmentUrl ?? null,
      createdBy: user.id,
      updatedBy: user.id,
    })
    .returning()

  setResponseStatus(event, 201)
  return row
})
