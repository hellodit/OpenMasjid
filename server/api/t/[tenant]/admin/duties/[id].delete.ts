import { and, eq, isNull } from 'drizzle-orm'
import { dutyAssignments } from '~~/server/db/schema'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)
  const [row] = await db
    .update(dutyAssignments)
    .set({ deletedAt: new Date(), updatedBy: user.id })
    .where(and(eq(dutyAssignments.id, id), isNull(dutyAssignments.deletedAt)))
    .returning({ id: dutyAssignments.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Jadwal petugas tidak ditemukan' })
  return { deleted: true }
})
