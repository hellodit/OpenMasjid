<script setup lang="ts">
import { dateParts } from '~/utils/format'
import type { DutyDayGroup } from '~/utils/duty-roster'

definePageMeta({ layout: false })

const api = useApiBase()
const tp = useTenantPath()
const route = useRoute()
const { tenant } = useTenantContext()

useHead({
  title: () => `Jadwal petugas — ${tenant.value?.name ?? 'OpenMasjid'}`,
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#1f3b2d' },
    { name: 'description', content: () => `Jadwal imam, khatib, muadzin, dan petugas ${tenant.value?.name ?? 'masjid'}.` },
  ],
})

/** Mosque-local today; the API answer (`data.today`) wins once loaded. */
const localToday = dateInTimeZone(tenant.value?.timezone ?? 'Asia/Jakarta')

// Monday-based week from `?week=YYYY-MM-DD` (any day of the week is accepted).
const from = computed(() => {
  const q = route.query.week
  const raw = typeof q === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q) && !Number.isNaN(Date.parse(q)) ? q : localToday
  return weekStart(raw)
})
const to = computed(() => addDays(from.value, 6))

const { data, pending, error } = await useFetch(`${api}/public/duties`, {
  key: 'portal-duties-week',
  query: { from, to },
})

const today = computed(() => data.value?.today ?? localToday)
const thisWeek = computed(() => weekStart(today.value))
const isThisWeek = computed(() => from.value === thisWeek.value)

/** All seven days, including ones without assignments. */
const days = computed<DutyDayGroup[]>(() => {
  const grouped = new Map(groupDutiesByDay(data.value?.items ?? []).map(d => [d.date, d]))
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(from.value, i)
    return grouped.get(date) ?? { date, services: [] }
  })
})
const hasAny = computed(() => (data.value?.items.length ?? 0) > 0)

const weekLabel = computed(() => {
  const a = dateParts(from.value)
  const b = dateParts(to.value)
  const yearA = from.value.slice(0, 4)
  const yearB = to.value.slice(0, 4)
  if (yearA !== yearB) return `${a.d} ${a.m} ${yearA} – ${b.d} ${b.m} ${yearB}`
  if (a.m === b.m) return `${a.d} – ${b.d} ${b.m} ${yearB}`
  return `${a.d} ${a.m} – ${b.d} ${b.m} ${yearB}`
})

function goWeek(start: string) {
  navigateTo({ query: start === thisWeek.value ? {} : { week: start } }, { replace: true })
}
</script>

<template>
  <div class="min-h-screen bg-cms-bg text-cms-ink font-sans antialiased">
    <PortalHeader subtitle="Jadwal petugas" :back-to="`${tp('/')}#petugas`" />

    <section class="relative overflow-hidden cms-hero-grad text-white">
      <div class="absolute inset-0 cms-pattern-khatam opacity-[0.18] pointer-events-none" />
      <div class="relative mx-auto max-w-2xl px-5 pt-7 pb-8">
        <div class="text-[11px] uppercase tracking-[2px] text-cms-gold-soft font-semibold mb-2">
          Imam · Khatib · Muadzin
        </div>
        <h1 class="font-serif text-[26px] leading-tight font-semibold">
          Jadwal Petugas
        </h1>
        <p class="text-[13.5px] text-white/80 mt-1.5">
          Petugas sholat dan kajian di {{ tenant?.name ?? 'masjid ini' }}.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-2xl px-4 py-6 pb-12">
      <!-- Week navigation -->
      <div class="flex items-center gap-2 mb-4">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-chevron-left"
          class="rounded-full bg-white shrink-0"
          aria-label="Pekan sebelumnya"
          @click="goWeek(addDays(from, -7))"
        />
        <div class="flex-1 min-w-0 text-center">
          <div class="text-[11px] uppercase tracking-[0.8px] text-cms-muted font-semibold">
            {{ isThisWeek ? 'Pekan ini' : 'Pekan' }}
          </div>
          <div class="font-serif text-[16px] font-semibold truncate">{{ weekLabel }}</div>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-chevron-right"
          class="rounded-full bg-white shrink-0"
          aria-label="Pekan berikutnya"
          @click="goWeek(addDays(from, 7))"
        />
      </div>
      <div v-if="!isThisWeek" class="flex justify-center -mt-2 mb-4">
        <UButton size="xs" color="neutral" variant="soft" icon="i-lucide-calendar-check" class="rounded-full" @click="goWeek(thisWeek)">
          Kembali ke pekan ini
        </UButton>
      </div>

      <div v-if="pending && !data" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-cms-lg" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        title="Gagal memuat jadwal petugas"
        description="Muat ulang halaman atau coba lagi beberapa saat."
      />

      <div
        v-else-if="hasAny"
        class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm overflow-hidden divide-y divide-cms-border transition-opacity"
        :class="pending ? 'opacity-60' : ''"
      >
        <template v-for="day in days" :key="day.date">
          <PortalDutyDay v-if="day.services.length" :day="day" :today="today" />
          <div
            v-else
            class="px-4 py-2.5 flex items-center gap-3 text-[12px] text-cms-muted"
            :class="day.date < today ? 'opacity-60' : ''"
          >
            <span class="min-w-14 shrink-0 font-semibold text-cms-ink-2">{{ dateParts(day.date).day }}, {{ dateParts(day.date).d }}</span>
            <span>Belum ada petugas terjadwal</span>
          </div>
        </template>
      </div>

      <div
        v-else
        class="bg-white rounded-cms-lg border border-dashed border-cms-border px-4 py-10 text-center"
      >
        <Icon name="lucide:calendar-x-2" size="22" class="text-cms-muted mx-auto mb-2" />
        <div class="text-[13.5px] font-semibold text-cms-ink-2">Belum ada jadwal petugas</div>
        <div class="text-[12px] text-cms-muted mt-1">
          Jadwal petugas untuk pekan ini belum diisi pengurus.
        </div>
      </div>
    </div>
  </div>
</template>
