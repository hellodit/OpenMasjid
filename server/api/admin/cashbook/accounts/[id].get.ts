import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAdmin } from '~~/server/utils/auth'
import { getAccountWithBalance } from '~~/server/utils/balance'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const row = await getAccountWithBalance(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
  return row
})
