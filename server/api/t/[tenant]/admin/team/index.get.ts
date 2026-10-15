import { and, asc, desc, inArray, isNull } from 'drizzle-orm'
import { tenantInvitations, users } from '~~/server/db/schema'

/** Pengurus (admin/viewer) + pending invitations. Owner only. */
export default defineTenantHandler('owner', async (_event, { db, tenant }) => {
  const [members, invitations] = await Promise.all([
    db.query.users.findMany({
      // users has no RLS (auth table) → always filter by tenant explicitly.
      where: (u, { eq }) => and(eq(u.tenantId, tenant.id), inArray(u.role, ['admin', 'viewer']), isNull(u.deletedAt)),
      columns: { id: true, fullName: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: [asc(users.fullName)],
    }),
    db.query.tenantInvitations.findMany({
      where: (i, { gt }) => and(isNull(i.acceptedAt), isNull(i.revokedAt), gt(i.expiresAt, new Date())),
      columns: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
      orderBy: [desc(tenantInvitations.createdAt)],
    }),
  ])
  return {
    members: members.map((m) => ({ ...m, isOwner: m.id === tenant.ownerUserId })),
    invitations,
  }
})
