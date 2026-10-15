import { and, count, eq, isNull, ne } from 'drizzle-orm'
import { announcements, dutyAssignments, events, tenantInvitations, users } from '~~/server/db/schema'

/** Setup wizard state + the "lengkapi profil" checklist on the dashboard. */
export default defineTenantHandler('staff', async (_event, { db, tenant }) => {
  const p = await getMosqueProfile(db)
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Profil masjid belum diatur' })

  const n = async (q: Promise<{ n: number }[]>) => ((await q)[0]?.n ?? 0) > 0
  const [hasEvent, hasAnnouncement, hasDuty, hasStaff, hasInvite] = await Promise.all([
    n(db.select({ n: count() }).from(events).where(isNull(events.deletedAt))),
    n(db.select({ n: count() }).from(announcements).where(isNull(announcements.deletedAt))),
    n(db.select({ n: count() }).from(dutyAssignments).where(isNull(dutyAssignments.deletedAt))),
    n(db.select({ n: count() }).from(users).where(and(
      eq(users.tenantId, tenant.id),
      isNull(users.deletedAt),
      ne(users.role, 'member'),
      tenant.ownerUserId ? ne(users.id, tenant.ownerUserId) : undefined,
    ))),
    n(db.select({ n: count() }).from(tenantInvitations).where(isNull(tenantInvitations.revokedAt))),
  ])

  return {
    completedAt: p.setupCompletedAt,
    profile: {
      name: p.name,
      addressLine: p.addressLine,
      city: p.city,
      province: p.province,
      postalCode: p.postalCode,
      latitude: p.latitude != null ? Number(p.latitude) : null,
      longitude: p.longitude != null ? Number(p.longitude) : null,
      timezone: p.timezone,
      phone: p.phone,
      whatsapp: p.whatsapp,
      email: p.email,
    },
    checklist: {
      location: p.latitude != null && p.longitude != null,
      address: !!(p.addressLine && p.city),
      contact: !!(p.phone || p.whatsapp || p.email),
      event: hasEvent,
      announcement: hasAnnouncement,
      duty: hasDuty,
      team: hasStaff || hasInvite,
    },
  }
})
