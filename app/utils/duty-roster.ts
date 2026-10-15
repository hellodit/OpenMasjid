import type { DutyRole, DutyService } from '#shared/utils/duties'
import { addDays } from '#shared/utils/duties'

/** Public duty row as returned by `GET public/duties`. */
export interface PublicDuty {
  id: string
  date: string
  service: DutyService
  role: DutyRole
  personName: string
  topic: string | null
}

export interface DutyServiceGroup {
  service: DutyService
  items: PublicDuty[]
  /** First topic set within the service (e.g. tema khutbah / kajian). */
  topic: string | null
}

export interface DutyDayGroup {
  date: string
  services: DutyServiceGroup[]
}

/**
 * Group duties (already sorted by date → service → role on the server)
 * into days, then services. Order is preserved.
 */
export function groupDutiesByDay(items: readonly PublicDuty[]): DutyDayGroup[] {
  const days: DutyDayGroup[] = []
  for (const it of items) {
    let day = days.at(-1)
    if (!day || day.date !== it.date) {
      day = { date: it.date, services: [] }
      days.push(day)
    }
    let svc = day.services.at(-1)
    if (!svc || svc.service !== it.service) {
      svc = { service: it.service, items: [], topic: null }
      day.services.push(svc)
    }
    svc.items.push(it)
    if (!svc.topic && it.topic) svc.topic = it.topic
  }
  return days
}

/** Monday of the week containing `date` (YYYY-MM-DD). */
export function weekStart(date: string): string {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay()
  return addDays(date, -((dow + 6) % 7))
}

/** Is `date` a Friday? */
export function isFriday(date: string): boolean {
  return new Date(`${date}T00:00:00Z`).getUTCDay() === 5
}

/** "Hari ini" / "Besok" relative to `today`, else null. */
export function relativeDayLabel(date: string, today: string): string | null {
  if (date === today) return 'Hari ini'
  if (date === addDays(today, 1)) return 'Besok'
  return null
}
