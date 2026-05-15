import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const hijriMonths = [
  'Muḥarram', 'Ṣafar', 'Rabīʿ I', 'Rabīʿ II', 'Jumādā I', 'Jumādā II',
  'Rajab', 'Shaʿbān', 'Ramadan', 'Shawwāl', 'Dhū al-Qaʿdah', 'Dhū al-Ḥijjah',
]

const pad = (n: number) => String(n).padStart(2, '0')

function approxHijri(date: Date) {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5)
  const l = jd - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  const l2 = l - 10631 * n + 354
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719))
    + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238))
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50))
    - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29
  const month = Math.floor((24 * l3) / 709)
  const day = l3 - Math.floor((709 * month) / 24)
  const year = 30 * n + j - 30
  return { day, month, year }
}

export function useDisplayClock() {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    now.value = new Date()
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  const hh = computed(() => pad(now.value.getHours()))
  const mm = computed(() => pad(now.value.getMinutes()))
  const ss = computed(() => pad(now.value.getSeconds()))

  const timeFull = computed(() => `${hh.value}:${mm.value}:${ss.value}`)
  const timeHHMM = computed(() => `${hh.value}:${mm.value}`)
  const timeSec = computed(() => `:${ss.value}`)

  const gregorianDate = computed(() => {
    const d = now.value
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
  })

  const hijriDate = computed(() => {
    const h = approxHijri(now.value)
    return `${h.day} ${hijriMonths[h.month - 1]} ${h.year} H`
  })

  return { now, timeFull, timeHHMM, timeSec, gregorianDate, hijriDate }
}
