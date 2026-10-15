import { sql } from 'drizzle-orm'
import { dutyAssignments } from '~~/server/db/schema'
import { dutyCopySchema } from '#shared/schemas/duties'

/**
 * Copy a range of assignments to another start date (e.g. "salin minggu lalu").
 * Slots that are already filled at the target are left untouched.
 */
export default defineTenantHandler('admin', async (event, { db, user }) => {
  const { sourceFrom, sourceTo, targetFrom } = await readZodBody(event, dutyCopySchema)
  const shift = daysBetween(sourceFrom, targetFrom)
  const source = await listDuties(db, sourceFrom, sourceTo)
  if (!source.length) return { copied: 0, skipped: 0 }

  const values = source.map((d) => ({
    date: addDays(d.date, shift),
    service: d.service,
    role: d.role,
    personName: d.personName,
    phone: d.phone,
    topic: null,
    notes: d.notes,
    createdBy: user.id,
    updatedBy: user.id,
  }))
  // `other` rows have no unique slot, so skip ones that already exist verbatim.
  const existing = await listDuties(db, addDays(sourceFrom, shift), addDays(sourceTo, shift))
  const key = (d: { date: string, service: string, role: string, personName: string }) =>
    `${d.date}|${d.service}|${d.role}|${d.role === 'other' ? d.personName : ''}`
  const taken = new Set(existing.map(key))
  const fresh = values.filter((v) => !taken.has(key(v)))

  const inserted = fresh.length
    ? await db
        .insert(dutyAssignments)
        .values(fresh)
        .onConflictDoNothing({
          target: [dutyAssignments.tenantId, dutyAssignments.date, dutyAssignments.service, dutyAssignments.role],
          where: sql`deleted_at IS NULL AND role <> 'other'`,
        })
        .returning({ id: dutyAssignments.id })
    : []
  return { copied: inserted.length, skipped: values.length - inserted.length }
})
