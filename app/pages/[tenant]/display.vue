<script setup lang="ts">
import { Coordinates, Qibla } from 'adhan'
import KhatamBackground from '~/components/display/KhatamBackground.vue'
import TopBar from '~/components/display/TopBar.vue'
import ClockBlock from '~/components/display/ClockBlock.vue'
import NextPrayerCard from '~/components/display/NextPrayerCard.vue'
import PrayerSlider from '~/components/display/PrayerSlider.vue'
import AnnouncementMarquee from '~/components/display/AnnouncementMarquee.vue'
import MasjidInfo from '~/components/display/MasjidInfo.vue'
const api = useApiBase()

definePageMeta({ layout: false })

const REFRESH_MS = 10 * 60_000

const { data: mosque, refresh: refreshMosque } = useFetch(`${api}/public/mosque`, { key: 'public-mosque' })
const { data: events, refresh: refreshEvents } = useFetch(`${api}/public/events`, {
  key: 'display-events',
  query: { limit: 5 },
})
const { data: cashbook, refresh: refreshCashbook } = useFetch(`${api}/public/cashbook/summary`, {
  key: 'display-cashbook',
  query: { period: 'month' },
})

const { now, timeFull, timeHHMM, timeSec, gregorianDate, hijriDate } = useDisplayClock(() => mosque.value?.timezone)
const { prayers, next, sunrise, countdown, refresh: refreshPrayers } = usePrayerSchedule(now)

// Keep a TV left running for days fresh.
let poll: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  poll = setInterval(() => {
    refreshMosque()
    refreshEvents()
    refreshCashbook()
    refreshPrayers()
  }, REFRESH_MS)
})
onBeforeUnmount(() => {
  if (poll) clearInterval(poll)
})

const mosqueName = computed(() => mosque.value?.name ?? 'OpenMasjid')
const mosqueAddress = computed(() =>
  [mosque.value?.addressLine, mosque.value?.city].filter(Boolean).join(' · '),
)

useHead({
  title: () => `${mosqueName.value} — TV Display`,
  htmlAttrs: { lang: 'id' },
  bodyAttrs: { class: 'overflow-hidden bg-tv-bg text-tv-ink font-sans' },
})

const announcements = computed(() => {
  const items = (events.value ?? []).map((ev) => {
    const { d, m, day } = dateParts(ev.startDate)
    const speaker = ev.speakers[0]?.name
    const time = formatTime(ev.startTime)
    const details = [
      speaker ? `bersama ${speaker}` : null,
      time ? `pukul ${time}` : null,
      ev.locationName ? `di ${ev.locationName}` : null,
    ].filter(Boolean).join(' ')
    return {
      prefix: `${day}, ${d} ${m}.`,
      body: details ? `${ev.title} — ${details}.` : ev.title,
    }
  })
  if (items.length) return items
  return [{
    prefix: `Selamat datang di ${mosqueName.value}.`,
    body: mosque.value?.tagline ?? 'Mari luruskan dan rapatkan shaf.',
  }]
})

const qiblaLabel = computed(() => {
  const lat = Number(mosque.value?.latitude)
  const lng = Number(mosque.value?.longitude)
  if (mosque.value?.latitude == null || mosque.value?.longitude == null || Number.isNaN(lat) || Number.isNaN(lng)) return null
  const deg = Qibla(new Coordinates(lat, lng))
  const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL']
  return `${Math.round(deg)}° ${dirs[Math.round(deg / 45) % 8]}`
})

const infoItems = computed(() => {
  const items: { label: string, value: string, gold?: boolean }[] = []
  if (sunrise.value) items.push({ label: 'Terbit', value: sunrise.value.time })
  if (next.value) items.push({ label: `Iqomah ${next.value.name}`, value: next.value.iq })
  if (qiblaLabel.value) items.push({ label: 'Kiblat', value: qiblaLabel.value, gold: true })
  return items
})
</script>

<template>
  <div
    class="canvas-bg relative w-screen h-screen flex flex-col overflow-hidden"
    style="padding: 4.4vh 4.17vw; gap: 3.3vh;"
  >
    <KhatamBackground />

    <TopBar
      :name="mosqueName"
      :address="mosqueAddress"
      :time="timeFull"
    />

    <div
      class="relative z-10 grid items-center flex-shrink-0"
      style="grid-template-columns: 1.05fr 0.95fr; gap: 2.9vw;"
    >
      <ClockBlock
        :hhmm="timeHHMM"
        :seconds="timeSec"
        :gregorian-date="gregorianDate"
        :hijri-date="hijriDate"
      />

      <NextPrayerCard
        :name="next?.name ?? '—'"
        :arabic="next?.ar ?? ''"
        :time="next?.time ?? '--:--'"
        :countdown="countdown"
      />
    </div>

    <PrayerSlider :prayers="prayers" :cashbook="cashbook" />

    <div
      class="relative z-10 grid items-center flex-shrink-0"
      style="grid-template-columns: 1fr auto; gap: 1.67vw;"
    >
      <AnnouncementMarquee :items="announcements" />
      <MasjidInfo v-if="infoItems.length" :items="infoItems" />
    </div>
  </div>
</template>
