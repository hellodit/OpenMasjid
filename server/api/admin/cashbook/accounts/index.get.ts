import { accountListQuery } from '#shared/schemas/cashbook'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const { includeArchived } = readZodQuery(event, accountListQuery)
  return listAccountsWithBalance({ includeArchived })
})
