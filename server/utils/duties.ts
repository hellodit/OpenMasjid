import { and, asc, gte, isNull, lte } from 'drizzle-orm'
import { dutyAssignments } from '../db/schema'
import type { DbOrTx } from './db'

/** Default window: today + 6 days (mosque-local). */
export function dutyRange(today: string, from?: string, to?: string) {
  const start = from ?? today
  return { from: start, to: to ?? addDays(start, 6) }
}

/** Position of a role within a service (khatib before imam on Friday). */
function roleRank(service: DutyService, role: DutyRole) {
  const i = DUTY_ROLES_BY_SERVICE[service].indexOf(role)
  return i === -1 ? 99 : i
}

/** Assignments in [from, to], ordered by date then service order. */
export async function listDuties(db: DbOrTx, from: string, to: string) {
  const rows = await db.query.dutyAssignments.findMany({
    where: and(isNull(dutyAssignments.deletedAt), gte(dutyAssignments.date, from), lte(dutyAssignments.date, to)),
    orderBy: [asc(dutyAssignments.date), asc(dutyAssignments.createdAt)],
  })
  return rows.sort((a, b) =>
    a.date.localeCompare(b.date)
    || DUTY_SERVICE_ORDER[a.service] - DUTY_SERVICE_ORDER[b.service]
    || roleRank(a.service, a.role) - roleRank(b.service, b.role))
}

export const DUTY_SLOT_TAKEN = 'Petugas untuk tugas ini di tanggal tersebut sudah ada'
