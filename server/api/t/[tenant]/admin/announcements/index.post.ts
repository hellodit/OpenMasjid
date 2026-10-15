import { announcements } from '~~/server/db/schema'
import { announcementSchema } from '#shared/schemas/announcements'

export default defineTenantHandler('admin', async (event, { db, user }) => {
  const data = await readZodBody(event, announcementSchema)
  const [row] = await db
    .insert(announcements)
    .values({
      ...data,
      publishedAt: data.status === 'published' ? new Date() : null,
      createdBy: user.id,
      updatedBy: user.id,
    })
    .returning()
  setResponseStatus(event, 201)
  return row
})
