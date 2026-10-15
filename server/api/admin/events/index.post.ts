import { eventCreateSchema } from '#shared/schemas/events'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const data = await readZodBody(event, eventCreateSchema)
  await assertEventCategory(data.categoryId)
  const id = await saveEvent(data, user.id)
  setResponseStatus(event, 201)
  return { id }
})
