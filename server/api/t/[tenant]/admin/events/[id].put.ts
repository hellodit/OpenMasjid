import { eventUpdateSchema } from '#shared/schemas/events'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const id = requireRouterId(event)
  const data = await readZodBody(event, eventUpdateSchema)
  await assertEventCategory(db, data.categoryId)
  await saveEvent(db, data, user.id, id)
  return { id }
})
