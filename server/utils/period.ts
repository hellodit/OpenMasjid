import { createError } from 'h3'

export interface DateRange {
  from: string
  to: string
}

function fmt(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Today's calendar date (YYYY-MM-DD) in the given IANA timezone. */
export function todayIn(timeZone: string, now = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/**
 * Resolve a reporting period to an inclusive date range.
 * "Today" is evaluated in the mosque's timezone, not UTC — otherwise between
 * 00:00 and 07:00 WIB the current day/month would still be the previous one.
 */
export function resolvePeriod(
  input: { period?: string, date?: string, from?: string, to?: string },
  timeZone: string,
): DateRange {
  if (input.from && input.to) {
    if (input.from > input.to)
      throw createError({ statusCode: 400, statusMessage: 'Tanggal awal harus sebelum tanggal akhir' })
    return { from: input.from, to: input.to }
  }

  const period = input.period ?? 'month'
  const refIso = input.date ?? todayIn(timeZone)
  const [y, m, d] = refIso.split('-').map(Number) as [number, number, number]
  const ref = new Date(Date.UTC(y, m - 1, d))

  if (period === 'day') return { from: refIso, to: refIso }
  if (period === 'week') {
    const day = ref.getUTCDay() || 7
    const start = new Date(ref)
    start.setUTCDate(ref.getUTCDate() - (day - 1))
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 6)
    return { from: fmt(start), to: fmt(end) }
  }
  if (period === 'month') {
    return { from: fmt(new Date(Date.UTC(y, m - 1, 1))), to: fmt(new Date(Date.UTC(y, m, 0))) }
  }
  if (period === 'year') return { from: `${y}-01-01`, to: `${y}-12-31` }
  throw createError({ statusCode: 400, statusMessage: 'Period harus day/week/month/year atau pakai from+to' })
}
