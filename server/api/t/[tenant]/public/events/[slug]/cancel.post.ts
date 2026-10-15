import { eq } from 'drizzle-orm'
import { registrants } from '~~/server/db/schema'

/** Cancel the current member's own registration (not after check-in). */
export default defineTenantHandler('member', async (event, { db, user }) => {
  const ev = await findPublishedEvent(db, getRouterParam(event, 'slug') ?? '')
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })

  const mine = await findOwnRegistration(db, ev.id, user.id)
  if (!mine || mine.cancelledAt)
    throw createError({ statusCode: 404, statusMessage: 'Anda belum terdaftar di kegiatan ini' })
  if (mine.attendedAt)
    throw createError({ statusCode: 409, statusMessage: 'Kehadiran sudah dicatat, pendaftaran tidak bisa dibatalkan' })

  await db.update(registrants).set({ cancelledAt: new Date() }).where(eq(registrants.id, mine.id))
  return { cancelled: true }
})
