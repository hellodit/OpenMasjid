import { eventUpdateSchema } from '#shared/schemas/events'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = requireRouterId(event)
  const data = await readZodBody(event, eventUpdateSchema)
  await assertEventCategory(data.categoryId)
  await saveEvent(data, user.id, id)
  return { id }
})
