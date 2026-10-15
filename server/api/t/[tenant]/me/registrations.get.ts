import { and, desc, eq, isNull } from 'drizzle-orm'
import { registrants } from '~~/server/db/schema'

/** The signed-in member's registrations in this mosque, with QR ticket codes. */
export default defineTenantHandler('member', async (_event, { db, tenant, user }) => {
  const rows = await db.query.registrants.findMany({
    where: and(eq(registrants.userId, user.id), isNull(registrants.deletedAt)),
    orderBy: [desc(registrants.registeredAt)],
    columns: { id: true, registeredAt: true, attendedAt: true, cancelledAt: true },
    with: {
      event: {
        columns: {
          slug: true, title: true, startDate: true, endDate: true, startTime: true, endTime: true,
          locationName: true, status: true, deletedAt: true,
        },
      },
    },
  })
  const today = dateInTimeZone(tenant.timezone)
  return rows
    .filter((r) => !r.event.deletedAt)
    .map(({ event: { deletedAt: _deleted, ...ev }, ...r }) => {
      const status = deriveRegistrantStatus(r)
      return {
        ...r,
        status,
        event: ev,
        isPast: (ev.endDate ?? ev.startDate) < today,
        ticket: status === 'cancelled' ? null : ticketCode(tenant.id, r.id),
      }
    })
})
