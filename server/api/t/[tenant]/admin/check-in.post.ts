import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { registrants } from '~~/server/db/schema'

const bodySchema = z.object({
  code: z.string().trim().min(10).max(120),
  /** Optional: reject tickets for a different event than the one being scanned. */
  eventId: z.uuid().optional(),
})

/** Check a member in by scanning their QR e-ticket. */
export default defineTenantHandler('admin', async (event, { db, tenant, user }) => {
  rateLimit(event, `check-in:${tenant.id}`, 120, 60_000)
  const { code, eventId } = await readZodBody(event, bodySchema)

  const registrantId = verifyTicketCode(tenant.id, code)
  if (!registrantId) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak valid untuk masjid ini' })

  const reg = await db.query.registrants.findFirst({
    where: (r, { and, eq, isNull }) => and(eq(r.id, registrantId), isNull(r.deletedAt)),
    with: {
      user: { columns: { fullName: true, email: true } },
      event: { columns: { id: true, title: true, startDate: true } },
    },
  })
  if (!reg) throw createError({ statusCode: 404, statusMessage: 'Tiket tidak ditemukan' })
  if (eventId && reg.event.id !== eventId)
    throw createError({ statusCode: 409, statusMessage: `Tiket ini untuk kegiatan lain: ${reg.event.title}` })
  if (reg.cancelledAt) throw createError({ statusCode: 409, statusMessage: 'Pendaftaran ini sudah dibatalkan' })

  const alreadyCheckedIn = !!reg.attendedAt
  if (!alreadyCheckedIn)
    await db.update(registrants).set({ attendedAt: new Date(), checkedInBy: user.id }).where(eq(registrants.id, reg.id))

  return {
    alreadyCheckedIn,
    attendee: { name: reg.user.fullName, email: reg.user.email },
    event: reg.event,
    attendedAt: reg.attendedAt ?? new Date(),
  }
})
