import { computed, type Ref } from 'vue'

export interface Prayer {
  id: string
  name: string
  ar: string
  time: string
  iq: string
}

export interface PrayerState extends Prayer {
  isCurrent: boolean
  isNext: boolean
  isPassed: boolean
}

const DEFAULT_PRAYERS: Prayer[] = [
  { id: 'subuh',   name: 'Subuh',   ar: 'الفجر',    time: '04:32', iq: '04:42' },
  { id: 'dzuhur',  name: 'Dzuhur',  ar: 'الظهر',   time: '11:54', iq: '12:04' },
  { id: 'ashar',   name: 'Ashar',   ar: 'العصر',   time: '15:18', iq: '15:28' },
  { id: 'maghrib', name: 'Maghrib', ar: 'المغرب', time: '17:51', iq: '17:56' },
  { id: 'isya',    name: 'Isya',    ar: 'العشاء', time: '19:04', iq: '19:14' },
]

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function usePrayerSchedule(now: Ref<Date>, schedule: Prayer[] = DEFAULT_PRAYERS) {
  const nowMin = computed(() => now.value.getHours() * 60 + now.value.getMinutes())

  const next = computed<Prayer>(() => {
    for (const p of schedule) {
      if (toMin(p.time) > nowMin.value) return p
    }
    return schedule[0]
  })

  const current = computed<Prayer | null>(() => {
    let curr: Prayer | null = null
    for (const p of schedule) {
      if (toMin(p.time) <= nowMin.value) curr = p
    }
    return curr
  })

  const prayers = computed<PrayerState[]>(() => {
    return schedule.map((p) => {
      const min = toMin(p.time)
      const isNext = next.value.id === p.id
      const isCurrent = !!current.value && current.value.id === p.id && (nowMin.value - min) < 25
      const isPassed = min < nowMin.value && !isCurrent
      return { ...p, isCurrent, isNext, isPassed }
    })
  })

  const countdown = computed(() => {
    let diff = toMin(next.value.time) - nowMin.value
    if (diff < 0) diff += 24 * 60
    const h = Math.floor(diff / 60)
    const m = diff % 60
    return h > 0 ? `${h} jam ${m} menit` : `${m} menit lagi`
  })

  return { prayers, next, current, countdown }
}
