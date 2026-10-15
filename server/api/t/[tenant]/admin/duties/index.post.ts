import { dutyAssignments } from '~~/server/db/schema'
import { dutySchema } from '#shared/schemas/duties'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const data = await readZodBody(event, dutySchema)
  try {
    const [row] = await db.insert(dutyAssignments).values({ ...data, createdBy: user.id, updatedBy: user.id }).returning()
    setResponseStatus(event, 201)
    return row
  }
  catch (err) {
    if (isUniqueViolation(err)) throw createError({ statusCode: 409, statusMessage: DUTY_SLOT_TAKEN })
    throw err
  }
})
