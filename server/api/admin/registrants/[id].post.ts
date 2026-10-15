import { and, eq, isNull } from 'drizzle-orm'
import { registrants } from '~~/server/db/schema'
import { registrantActionSchema } from '#shared/schemas/events'

/** Operator actions on a registration: check-in / undo / cancel / restore. */
export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = requireRouterId(event)
  const { action } = await readZodBody(event, registrantActionSchema)

  const now = new Date()
  const patch = {
    'check-in': { attendedAt: now, checkedInBy: user.id, cancelledAt: null },
    'undo-check-in': { attendedAt: null, checkedInBy: null },
    'cancel': { cancelledAt: now },
    'restore': { cancelledAt: null },
  }[action]

  const [row] = await db
    .update(registrants)
    .set(patch)
    .where(and(eq(registrants.id, id), isNull(registrants.deletedAt)))
    .returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Pendaftar tidak ditemukan' })
  return { ...row, status: deriveRegistrantStatus(row) }
})
