export default defineTenantHandler('staff', async (event, { db }) => {
  const row = await getAccountWithBalance(db, requireRouterId(event))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
  return row
})
