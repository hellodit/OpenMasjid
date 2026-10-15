import { computed, onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter } from 'vue'
import { hijriLabel } from '#shared/utils/prayer'

const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Indonesian zone abbreviations; anything else falls back to Intl's short name. */
const TZ_ABBR: Record<string, string> = {
  'Asia/Jakarta': 'WIB',
  'Asia/Pontianak': 'WIB',
  'Asia/Makassar': 'WITA',
  'Asia/Jayapura': 'WIT',
}

export const DEFAULT_TIMEZONE = 'Asia/Jakarta'

function safeZone(tz: string | null | undefined): string {
  if (!tz) return DEFAULT_TIMEZONE
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return tz
  }
  catch {
    return DEFAULT_TIMEZONE
  }
}

/** Wall-clock parts of `date` in `timeZone`. */
export function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? ''
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: weekdayIndex[get('weekday')] ?? 0,
    hh: get('hour').padStart(2, '0'),
    mm: get('minute').padStart(2, '0'),
    ss: get('second').padStart(2, '0'),
  }
}

/**
 * Ticking clock rendered in the mosque timezone (not the viewer's).
 * The initial instant is shared SSR → client through `useState` so the
 * hydrated markup matches; it starts ticking once mounted.
 */
export function useDisplayClock(timezone: MaybeRefOrGetter<string | null | undefined> = DEFAULT_TIMEZONE) {
  const nowMs = useState('display-clock-now', () => Date.now())
  const now = computed(() => new Date(nowMs.value))
  const tz = computed(() => safeZone(toValue(timezone)))

  let timer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    nowMs.value = Date.now()
    timer = setInterval(() => {
      nowMs.value = Date.now()
    }, 1000)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  const parts = computed(() => zonedParts(now.value, tz.value))

  const timeFull = computed(() => `${parts.value.hh}:${parts.value.mm}:${parts.value.ss}`)
  const timeHHMM = computed(() => `${parts.value.hh}:${parts.value.mm}`)
  const timeSec = computed(() => `:${parts.value.ss}`)

  /** Mosque-local calendar date, `YYYY-MM-DD`. */
  const localDate = computed(() => {
    const p = parts.value
    return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`
  })

  const gregorianDate = computed(() => {
    const p = parts.value
    return `${dayNames[p.weekday]}, ${p.day} ${monthNames[p.month - 1]} ${p.year}`
  })

  const hijriDate = computed(() => hijriLabel(now.value, tz.value))

  const zoneLabel = computed(() => {
    if (TZ_ABBR[tz.value]) return TZ_ABBR[tz.value]!
    const name = new Intl.DateTimeFormat('id-ID', { timeZone: tz.value, timeZoneName: 'short' })
      .formatToParts(now.value)
      .find(p => p.type === 'timeZoneName')?.value
    return name ?? tz.value
  })

  return { now, timezone: tz, localDate, timeFull, timeHHMM, timeSec, gregorianDate, hijriDate, zoneLabel }
}
