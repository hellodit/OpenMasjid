import { accountListQuery } from '#shared/schemas/cashbook'

export default defineTenantHandler('staff', async (event, { db }) => {
  const { includeArchived } = readZodQuery(event, accountListQuery)
  return listAccountsWithBalance(db, { includeArchived })
})
