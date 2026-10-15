import { and, eq, isNull } from 'drizzle-orm'
import { tenantInvitations } from '~~/server/db/schema'

export default defineTenantHandler('owner', async (event, { db }) => {
  const id = requireRouterId(event)
  const [row] = await db
    .update(tenantInvitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(tenantInvitations.id, id), isNull(tenantInvitations.acceptedAt), isNull(tenantInvitations.revokedAt)))
    .returning({ id: tenantInvitations.id })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan' })
  return { revoked: true }
})
