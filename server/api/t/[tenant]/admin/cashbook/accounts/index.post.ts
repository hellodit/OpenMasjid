import { cashAccounts } from '~~/server/db/schema'
import { accountCreateSchema } from '#shared/schemas/cashbook'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const data = await readZodBody(event, accountCreateSchema)
  const [row] = await db
    .insert(cashAccounts)
    .values({ ...data, createdBy: user.id, updatedBy: user.id })
    .returning()
  setResponseStatus(event, 201)
  return row
})
