import { computed, ref, watch, type Ref } from 'vue'
import { dateInTimeZone, type PrayerTime } from '#shared/utils/prayer'

export type Prayer = PrayerTime

export interface PrayerState extends PrayerTime {
  /** Between adzan and a short while after iqamah. */
  isCurrent: boolean
  isNext: boolean
  isPassed: boolean
}

/** How long after iqamah a prayer still counts as "Sekarang". */
const CURRENT_WINDOW_MS = 15 * 60_000

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h} jam ${m} menit`
  return totalMin <= 0 ? 'Sebentar lagi' : `${m} menit lagi`
}

/**
 * Prayer schedule from `GET /api/public/prayer-times` (computed server-side
 * with `adhan` from the mosque coordinates). Today's and tomorrow's schedules
 * are fetched together so "next prayer" after Isya is tomorrow's Subuh, and
 * everything is compared via the absolute `at` / `iqAt` timestamps.
 * Refetches when the mosque-local date rolls over.
 */
export function usePrayerSchedule(now: Ref<Date>) {
  const api = useApiBase()
  const requestedDate = ref<string>()

  const { data, pending, error, refresh } = useAsyncData('public-prayer-schedule', async () => {
    const today = await $fetch(`${api}/public/prayer-times`, {
      query: requestedDate.value ? { date: requestedDate.value } : {},
    })
    const tomorrow = await $fetch(`${api}/public/prayer-times`, {
      query: { date: addDays(today.date, 1) },
    }).catch(() => null)
    return { today, tomorrow }
  })

  const timezone = computed(() => data.value?.today.timezone ?? 'Asia/Jakarta')
  const date = computed(() => data.value?.today.date ?? null)
  const hijri = computed(() => data.value?.today.hijri ?? null)

  /** Today's full list, including `terbit`. */
  const allPrayers = computed<PrayerTime[]>(() => data.value?.today.prayers ?? [])
  const sunrise = computed(() => allPrayers.value.find(p => p.id === 'terbit') ?? null)

  /** Obligatory prayers of today followed by tomorrow's (no `terbit`). */
  const timeline = computed(() =>
    [...(data.value?.today.prayers ?? []), ...(data.value?.tomorrow?.prayers ?? [])]
      .filter(p => p.id !== 'terbit')
      .map(p => ({ ...p, atMs: Date.parse(p.at), iqAtMs: Date.parse(p.iqAt) })),
  )

  const nowMs = computed(() => now.value.getTime())

  const next = computed<PrayerTime | null>(() =>
    timeline.value.find(p => p.atMs > nowMs.value) ?? null,
  )

  const current = computed<PrayerTime | null>(() => {
    let curr: (typeof timeline.value)[number] | null = null
    for (const p of timeline.value) {
      if (p.atMs <= nowMs.value) curr = p
    }
    return curr && nowMs.value < curr.iqAtMs + CURRENT_WINDOW_MS ? curr : null
  })

  /** Today's five obligatory prayers with display state. */
  const prayers = computed<PrayerState[]>(() => {
    const n = next.value
    const c = current.value
    // When the next prayer is tomorrow's (after Isya), flag today's card of the same id.
    const nextIsTomorrow = !!n && !allPrayers.value.some(p => p.at === n.at)
    return allPrayers.value
      .filter(p => p.id !== 'terbit')
      .map((p) => {
        const isNext = !!n && (n.at === p.at || (nextIsTomorrow && n.id === p.id))
        const isCurrent = !!c && c.at === p.at
        const isPassed = !isCurrent && !isNext && Date.parse(p.at) <= nowMs.value
        return { ...p, isCurrent, isNext, isPassed }
      })
  })

  const countdownMs = computed(() => (next.value ? Date.parse(next.value.at) - nowMs.value : null))
  const countdown = computed(() => (countdownMs.value == null ? '—' : formatCountdown(countdownMs.value)))

  // Refetch once the mosque-local date changes (e.g. at midnight on a TV left running).
  const localDate = computed(() => dateInTimeZone(timezone.value, now.value))
  watch(localDate, (d, prev) => {
    if (!import.meta.client || !prev || d === prev || d === date.value) return
    requestedDate.value = d
    refresh()
  })

  return {
    prayers,
    allPrayers,
    sunrise,
    next,
    current,
    countdown,
    countdownMs,
    timezone,
    date,
    hijri,
    pending,
    error,
    refresh,
  }
}
