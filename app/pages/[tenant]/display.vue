<script setup lang="ts">
import { Coordinates, Qibla } from 'adhan'
import KhatamBackground from '~/components/display/KhatamBackground.vue'
import TopBar from '~/components/display/TopBar.vue'
import ClockBlock from '~/components/display/ClockBlock.vue'
import NextPrayerCard from '~/components/display/NextPrayerCard.vue'
import PrayerSlider from '~/components/display/PrayerSlider.vue'
import AnnouncementMarquee from '~/components/display/AnnouncementMarquee.vue'
import MasjidInfo from '~/components/display/MasjidInfo.vue'
import type { DutySlideColumn } from '~/components/display/DutySlide.vue'
import { DUTY_ROLE_LABELS, DUTY_SERVICE_LABELS, DUTY_SERVICE_ORDER, type DutyRole, type DutyService } from '#shared/utils/duties'
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
const { data: displayAnnouncements, refresh: refreshAnnouncements } = useFetch(`${api}/public/announcements`, {
  key: 'display-announcements',
  query: { limit: 10, display: '1' },
})
const { data: duties, refresh: refreshDuties } = useFetch(`${api}/public/duties`, { key: 'display-duties' })

const { now, timeFull, timeHHMM, timeSec, gregorianDate, hijriDate } = useDisplayClock(() => mosque.value?.timezone)
const { prayers, next, sunrise, countdown, refresh: refreshPrayers } = usePrayerSchedule(now)

// Keep a TV left running for days fresh.
let poll: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  poll = setInterval(() => {
    refreshMosque()
    refreshEvents()
    refreshCashbook()
    refreshAnnouncements()
    refreshDuties()
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

/** Collapse whitespace/line breaks and cap the length for the marquee. */
function singleLine(text: string | null, max = 160): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

const announcements = computed(() => {
  // Announcements (pinned first, as sorted by the API) come before upcoming events.
  const notices = (displayAnnouncements.value ?? []).map(a => ({
    prefix: singleLine(a.title, 80),
    body: singleLine(a.body),
  }))
  const eventItems = (events.value ?? []).map((ev) => {
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
  const items = [...notices, ...eventItems]
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

// ── Duty roster ──────────────────────────────────────────────────────────
const timezone = computed(() => mosque.value?.timezone ?? 'Asia/Jakarta')
const localToday = computed(() => dateInTimeZone(timezone.value, now.value))

function dutiesOf(date: string, service: DutyService) {
  return (duties.value?.items ?? []).filter(d => d.date === date && d.service === service)
}
function personFor(date: string, service: DutyService, role: DutyRole) {
  return dutiesOf(date, service).find(d => d.role === role)?.personName ?? null
}

/** Mosque-local date + duty service of the next prayer (Dzuhur on Friday → Jum'at). */
const nextService = computed<{ date: string, service: DutyService } | null>(() => {
  const n = next.value
  if (!n || n.id === 'sunrise') return null
  const date = dateInTimeZone(timezone.value, new Date(n.at))
  return { date, service: n.id === 'dhuhr' && isFriday(date) ? 'jumuah' : n.id }
})

/** The Friday whose Jum'at officials are relevant now: Thursday after Maghrib until Ashar on Friday. */
const jumuahDate = computed<string | null>(() => {
  const n = next.value
  if (!n || n.id === 'sunrise') return null
  const date = dateInTimeZone(timezone.value, new Date(n.at))
  if (isFriday(date) && (n.id === 'fajr' || n.id === 'dhuhr' || n.id === 'asr')) return date
  if (n.id === 'isha' && isFriday(addDays(date, 1))) return addDays(date, 1)
  return null
})
const jumuahDuties = computed(() => (jumuahDate.value ? dutiesOf(jumuahDate.value, 'jumuah') : []))

function dayLabel(date: string) {
  const prefix = date === localToday.value ? 'Hari ini' : date === addDays(localToday.value, 1) ? 'Besok' : dateParts(date).day
  return `${prefix}, ${formatDate(date)}`
}

/** TV slide: Jum'at officials in the Friday window, otherwise today's roster. */
const dutySlide = computed(() => {
  if (jumuahDate.value && jumuahDuties.value.length) {
    const columns: DutySlideColumn[] = jumuahDuties.value.map(d => ({
      label: DUTY_ROLE_LABELS[d.role],
      people: [{ name: d.personName }],
    }))
    const topic = jumuahDuties.value.find(d => d.role === 'khatib' && d.topic)?.topic
      ?? jumuahDuties.value.find(d => d.topic)?.topic
      ?? null
    return { title: "Petugas Sholat Jum'at", dateLabel: dayLabel(jumuahDate.value), columns, topic }
  }
  const today = localToday.value
  const items = (duties.value?.items ?? []).filter(d => d.date === today)
  if (!items.length) return null
  const byService = new Map<DutyService, DutySlideColumn>()
  for (const d of items) {
    const col = byService.get(d.service) ?? { label: DUTY_SERVICE_LABELS[d.service], people: [] }
    col.people.push({ role: DUTY_ROLE_LABELS[d.role], name: d.personName })
    byService.set(d.service, col)
  }
  const columns = [...byService.entries()]
    .sort(([a], [b]) => DUTY_SERVICE_ORDER[a] - DUTY_SERVICE_ORDER[b])
    .map(([, col]) => col)
  return { title: 'Petugas Sholat Hari Ini', dateLabel: dayLabel(today), columns, topic: null }
})

const infoItems = computed(() => {
  const items: { label: string, value: string, gold?: boolean }[] = []
  if (sunrise.value) items.push({ label: 'Terbit', value: sunrise.value.time })
  if (next.value) items.push({ label: `Iqomah ${next.value.name}`, value: next.value.iq })
  const ns = nextService.value
  const imam = ns ? personFor(ns.date, ns.service, 'imam') : null
  if (ns && imam) items.push({ label: ns.service === 'jumuah' ? "Imam Jum'at" : `Imam ${next.value!.name}`, value: imam })
  const khatib = jumuahDate.value ? personFor(jumuahDate.value, 'jumuah', 'khatib') : null
  if (khatib) items.push({ label: "Khatib Jum'at", value: khatib })
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

    <PrayerSlider :prayers="prayers" :cashbook="cashbook" :duty="dutySlide" />

    <div
      class="relative z-10 grid items-center flex-shrink-0"
      style="grid-template-columns: 1fr auto; gap: 1.67vw;"
    >
      <AnnouncementMarquee :items="announcements" />
      <MasjidInfo v-if="infoItems.length" :items="infoItems" />
    </div>
  </div>
</template>
