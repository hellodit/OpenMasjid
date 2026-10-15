<script setup lang="ts">
import { dateInTimeZone, type PrayerTime } from '#shared/utils/prayer'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  prayers: PrayerTime[]
  place: string
  date: string
  hijri: string
  timezone: string
}>()

/* Rendered client-side only (preview is fetched after mount), so `Date.now()` is safe. */
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => (timer = setInterval(() => (now.value = Date.now()), 30_000)))
onBeforeUnmount(() => clearInterval(timer))

const obligatory = computed(() => props.prayers.filter(p => p.id !== 'sunrise'))
const isToday = computed(() => props.date === dateInTimeZone(props.timezone, new Date(now.value)))

const next = computed(() => isToday.value ? obligatory.value.find(p => new Date(p.at).getTime() > now.value) : undefined)

const countdown = computed(() => {
  if (!next.value) return isToday.value ? 'menunggu Subuh esok hari' : `jadwal ${formatDate(props.date)}`
  const mins = Math.max(0, Math.round((new Date(next.value.at).getTime() - now.value) / 60_000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h ? `${h} jam ` : ''}${m} menit menuju ${next.value.name}`
})

const iqMinutes = (p: PrayerTime) => Math.round((new Date(p.iqAt).getTime() - new Date(p.at).getTime()) / 60_000)
</script>

<template>
  <div class="relative rounded-cms px-4 pt-4 pb-4 text-white overflow-hidden mt-1.5 cms-hero-grad-dark">
    <div class="cms-pattern-strip absolute inset-0 opacity-30" />
    <div class="relative z-[1]">
      <div class="flex items-start justify-between gap-3 text-[11px] text-[oklch(0.85_0.04_155)] tracking-[0.4px] uppercase font-semibold mb-4">
        <div class="min-w-0 truncate">{{ place }}</div>
        <div class="text-right leading-tight shrink-0">
          {{ formatDate(date) }}<br><span class="text-cms-gold">{{ hijri }}</span>
        </div>
      </div>

      <div class="bg-white/5 border border-white/15 rounded-[10px] px-3.5 py-3 text-center mb-3">
        <div class="text-[10.5px] tracking-[0.6px] uppercase text-cms-gold font-semibold">
          Berikutnya · {{ next?.name ?? obligatory[0]?.name ?? '—' }}
        </div>
        <div class="font-serif text-[38px] font-bold tracking-[-1px] my-0.5">{{ next?.time ?? obligatory[0]?.time ?? '--:--' }}</div>
        <div class="font-mono text-[11px] text-[oklch(0.88_0.03_155)] tracking-[0.4px]">— {{ countdown }}</div>
      </div>

      <div class="grid grid-cols-5 gap-1 text-center">
        <div
          v-for="c in obligatory"
          :key="c.id"
          :class="[
            'rounded-lg py-2 px-1 border',
            c.id === next?.id
              ? 'bg-cms-gold text-cms-green-900 border-cms-gold'
              : 'bg-white/[0.06] border-transparent',
          ]"
        >
          <div class="text-[9.5px] tracking-[0.4px] uppercase font-semibold opacity-85">{{ c.name }}</div>
          <div class="font-mono text-[13px] font-bold mt-0.5">{{ c.time }}</div>
          <div
            :class="['text-[9px] tracking-[0.2px] font-medium', c.id === next?.id ? 'text-[oklch(0.36_0.06_155)]' : 'text-[oklch(0.82_0.04_78)]']"
          >
            iqamah +{{ iqMinutes(c) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
