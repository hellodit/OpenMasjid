export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const row = await getAccountWithBalance(requireRouterId(event))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
  return row
})
