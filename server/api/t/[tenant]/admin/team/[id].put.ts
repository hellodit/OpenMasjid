import { and, eq, inArray, isNull } from 'drizzle-orm'
import { users } from '~~/server/db/schema'
import { teamMemberUpdateSchema } from '#shared/schemas/tenants'

/** Change a pengurus' role or (de)activate them. The owner cannot be changed here. */
export default defineTenantHandler('owner', async (event, { db, tenant }) => {
  const id = requireRouterId(event)
  const data = await readZodBody(event, teamMemberUpdateSchema)
  if (id === tenant.ownerUserId)
    throw createError({ statusCode: 400, statusMessage: 'Peran pemilik masjid tidak bisa diubah' })

  const [row] = await db
    .update(users)
    .set(data)
    .where(and(
      eq(users.id, id),
      eq(users.tenantId, tenant.id),
      inArray(users.role, ['admin', 'viewer']),
      isNull(users.deletedAt),
    ))
    .returning({ id: users.id, role: users.role, isActive: users.isActive })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Pengurus tidak ditemukan' })

  // Deactivated staff lose their sessions immediately.
  if (data.isActive === false) await revokeUserSessions(db, row.id)
  return row
})
