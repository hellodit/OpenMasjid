import { defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '~~/server/utils/auth'
import { listAccountsWithBalance } from '~~/server/utils/balance'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const includeArchived = query.includeArchived === 'true' || query.includeArchived === '1'
  return listAccountsWithBalance({ includeArchived })
})
