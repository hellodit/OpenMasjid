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

export function resolvePeriod(input: {
  period?: string
  date?: string
  from?: string
  to?: string
}): DateRange {
  if (input.from && input.to) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.from) || !/^\d{4}-\d{2}-\d{2}$/.test(input.to))
      throw createError({ statusCode: 400, statusMessage: 'Format tanggal: YYYY-MM-DD' })
    return { from: input.from, to: input.to }
  }

  const period = input.period ?? 'month'
  const refIso = input.date ?? fmt(new Date())
  if (!/^\d{4}-\d{2}-\d{2}$/.test(refIso))
    throw createError({ statusCode: 400, statusMessage: 'Format tanggal: YYYY-MM-DD' })

  const [yStr, mStr, dStr] = refIso.split('-')
  const y = Number(yStr)
  const m = Number(mStr)
  const d = Number(dStr)
  const ref = new Date(Date.UTC(y, m - 1, d))

  if (period === 'day') {
    return { from: refIso, to: refIso }
  }
  if (period === 'week') {
    const day = ref.getUTCDay() || 7
    const start = new Date(ref)
    start.setUTCDate(ref.getUTCDate() - (day - 1))
    const end = new Date(start)
    end.setUTCDate(start.getUTCDate() + 6)
    return { from: fmt(start), to: fmt(end) }
  }
  if (period === 'month') {
    const start = new Date(Date.UTC(y, m - 1, 1))
    const end = new Date(Date.UTC(y, m, 0))
    return { from: fmt(start), to: fmt(end) }
  }
  if (period === 'year') {
    return { from: `${y}-01-01`, to: `${y}-12-31` }
  }
  throw createError({ statusCode: 400, statusMessage: 'Period harus day/week/month/year atau pakai from+to' })
}
