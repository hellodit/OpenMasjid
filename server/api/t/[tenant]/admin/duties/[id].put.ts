import { and, eq, isNull } from 'drizzle-orm'
import { dutyAssignments } from '~~/server/db/schema'
import { dutySchema } from '#shared/schemas/duties'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)
  const data = await readZodBody(event, dutySchema)
  try {
    const [row] = await db
      .update(dutyAssignments)
      .set({ ...data, updatedBy: user.id })
      .where(and(eq(dutyAssignments.id, id), isNull(dutyAssignments.deletedAt)))
      .returning()
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Jadwal petugas tidak ditemukan' })
    return row
  }
  catch (err) {
    if (isUniqueViolation(err)) throw createError({ statusCode: 409, statusMessage: DUTY_SLOT_TAKEN })
    throw err
  }
})
