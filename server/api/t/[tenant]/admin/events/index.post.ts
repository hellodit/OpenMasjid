import { eventCreateSchema } from '#shared/schemas/events'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const data = await readZodBody(event, eventCreateSchema)
  await assertEventCategory(db, data.categoryId)
  const id = await saveEvent(db, data, user.id)
  setResponseStatus(event, 201)
  return { id }
})
