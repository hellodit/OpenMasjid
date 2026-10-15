import { cashAccounts } from '~~/server/db/schema'
import { accountCreateSchema } from '#shared/schemas/cashbook'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const data = await readZodBody(event, accountCreateSchema)
  const [row] = await db
    .insert(cashAccounts)
    .values({ ...data, createdBy: user.id, updatedBy: user.id })
    .returning()
  setResponseStatus(event, 201)
  return row
})
