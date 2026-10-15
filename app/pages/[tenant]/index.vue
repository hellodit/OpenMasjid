<script setup lang="ts">
import { dateParts, formatDate, formatTimeRange } from '~/utils/format'
const api = useApiBase()
const tp = useTenantPath()

definePageMeta({ layout: false })

const { data: mosque } = useFetch(`${api}/public/mosque`, { key: 'public-mosque' })
const { data: events, pending: eventsPending } = useFetch(`${api}/public/events`, {
  key: 'portal-events',
  query: { limit: 50 },
})
const { data: announcements } = useFetch(`${api}/public/announcements`, {
  key: 'portal-announcements',
  query: { limit: 10 },
})
const { data: duties } = useFetch(`${api}/public/duties`, { key: 'portal-duties' })

/** Announcements shown on the home page; the rest live on /announcements. */
const ANNOUNCEMENTS_ON_HOME = 3
const homeAnnouncements = computed(() => (announcements.value ?? []).slice(0, ANNOUNCEMENTS_ON_HOME))

const friday = computed(() => (duties.value ? nextFriday(duties.value.today) : null))
const fridayDuties = computed(() => (duties.value?.items ?? []).filter(d => d.date === friday.value && d.service === 'jumuah'))
/** This week's roster; the Friday prayer shown in its own card is left out. */
const weekDuties = computed(() => groupDutiesByDay((duties.value?.items ?? [])
  .filter(d => !(fridayDuties.value.length && d.date === friday.value && d.service === 'jumuah'))))

const { now, timeHHMM, gregorianDate, hijriDate, zoneLabel } = useDisplayClock(() => mosque.value?.timezone)
const { prayers, next, sunrise, countdown } = usePrayerSchedule(now)

const mosqueName = computed(() => mosque.value?.name ?? 'OpenMasjid')
const addressMain = computed(() => mosque.value?.addressLine || mosque.value?.city || null)
const addressSub = computed(() => {
  if (!mosque.value) return null
  const parts = mosque.value.addressLine
    ? [mosque.value.city, mosque.value.province, mosque.value.postalCode]
    : [mosque.value.province, mosque.value.postalCode]
  return parts.filter(Boolean).join(', ') || null
})
const fullAddress = computed(() => [addressMain.value, addressSub.value].filter(Boolean).join(', '))
const mapsUrl = computed(() => {
  const m = mosque.value
  if (!m) return null
  if (m.latitude != null && m.longitude != null) return `https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}`
  return fullAddress.value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.name}, ${fullAddress.value}`)}` : null
})
const whatsappUrl = computed(() => {
  const wa = mosque.value?.whatsapp?.replace(/\D/g, '')
  if (!wa) return null
  return `https://wa.me/${wa.startsWith('0') ? `62${wa.slice(1)}` : wa}`
})
const socials = computed(() => {
  const m = mosque.value
  if (!m) return []
  return [
    { url: m.websiteUrl, icon: 'i-lucide-globe', label: 'Website' },
    { url: m.instagramUrl, icon: 'i-lucide-instagram', label: 'Instagram' },
    { url: m.youtubeUrl, icon: 'i-lucide-youtube', label: 'YouTube' },
    { url: m.facebookUrl, icon: 'i-lucide-facebook', label: 'Facebook' },
    { url: m.tiktokUrl, icon: 'i-lucide-music-2', label: 'TikTok' },
  ].filter((s): s is { url: string, icon: string, label: string } => !!s.url)
})

useHead({
  title: () => `${mosqueName.value} — OpenMasjid`,
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#1f3b2d' },
    { name: 'description', content: () => `Profil, jadwal sholat, dan kegiatan ${mosqueName.value}.` },
  ],
})

type PublicEvent = NonNullable<typeof events.value>[number]

const categories = computed(() => {
  const map = new Map<string, NonNullable<PublicEvent['category']>>()
  for (const ev of events.value ?? []) {
    if (ev.category && !map.has(ev.category.slug)) map.set(ev.category.slug, ev.category)
  }
  return [...map.values()]
})

const activeFilter = ref<string>('all')

const filteredEvents = computed(() => {
  const list = events.value ?? []
  return activeFilter.value === 'all'
    ? list
    : list.filter(e => e.category?.slug === activeFilter.value)
})

function registrationTone(ev: PublicEvent): { label: string, cls: string } {
  if (ev.displayStatus === 'full') return { label: 'Kuota penuh', cls: 'bg-cms-rose-soft text-cms-rose' }
  if (ev.displayStatus === 'ongoing') return { label: 'Sedang berjalan', cls: 'bg-cms-gold-soft text-cms-gold-ink' }
  if (!ev.requiresRegistration) return { label: 'Terbuka untuk umum', cls: 'bg-cms-info-soft text-cms-info' }
  if (mosque.value && !mosque.value.isRegistrationOpen) return { label: 'Pendaftaran ditutup', cls: 'bg-cms-surface-2 text-cms-muted' }
  return { label: 'Pendaftaran dibuka', cls: 'bg-cms-green-100 text-cms-green-800' }
}

function eventSchedule(ev: PublicEvent): string {
  const time = formatTimeRange(ev.startTime, ev.endTime)
  if (ev.endDate && ev.endDate !== ev.startDate) {
    return [`s.d. ${formatDate(ev.endDate)}`, time].filter(Boolean).join(' · ')
  }
  return time
}
</script>

<template>
  <div class="min-h-screen bg-cms-bg text-cms-ink font-sans antialiased">
    <!-- Sticky top bar -->
    <header
      class="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-cms-border"
    >
      <div class="mx-auto max-w-2xl flex items-center gap-3 px-4 py-3">
        <div class="w-9 h-9 rounded-[10px] bg-cms-green-800 grid place-items-center text-cms-gold shrink-0">
          <AdminStarMark :size="20" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-serif text-[15px] font-semibold leading-tight truncate">
            {{ mosqueName }}
          </div>
          <div class="text-[11px] text-cms-muted truncate">
            OpenMasjid · Profil & Kegiatan
          </div>
        </div>
        <UButton
          :to="tp('/display')"
          target="_blank"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-tv"
          class="shrink-0 rounded-full text-[12px] font-semibold text-cms-green-800"
          aria-label="Buka tampilan Display TV"
        >
          <span class="hidden sm:inline">Display TV</span>
        </UButton>
        <div class="text-right shrink-0 hidden min-[400px]:block">
          <div class="font-mono text-[14px] font-semibold tabular-nums text-cms-ink">
            {{ timeHHMM }}
          </div>
          <div class="text-[10px] uppercase tracking-[0.8px] text-cms-muted">
            {{ zoneLabel }}
          </div>
        </div>
        <PortalAuthMenu />
      </div>
    </header>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-cms-green-900 text-white">
      <!-- Subtle ornament -->
      <div
        aria-hidden="true"
        class="absolute inset-0 opacity-[0.07] pointer-events-none"
        style="background-image: radial-gradient(circle at 25% 20%, oklch(0.78 0.10 78) 0, transparent 35%), radial-gradient(circle at 80% 80%, oklch(0.55 0.10 155) 0, transparent 40%);"
      />
      <div class="relative mx-auto max-w-2xl px-5 pt-9 pb-10">
        <div class="text-[11px] uppercase tracking-[2px] text-cms-gold-soft font-semibold mb-3">
          Assalamualaikum
        </div>
        <div v-if="mosque?.arabicName" class="font-arab text-[28px] leading-none text-cms-gold mb-4">
          {{ mosque.arabicName }}
        </div>
        <h1 class="font-serif text-[28px] sm:text-[34px] leading-[1.15] font-semibold mb-3">
          {{ mosqueName }}
        </h1>
        <p v-if="mosque?.tagline" class="text-[14.5px] leading-relaxed text-white/80 max-w-md">
          {{ mosque.tagline }}
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <UButton
            to="#jadwal-sholat"
            icon="i-lucide-clock"
            class="rounded-full bg-cms-gold hover:bg-cms-gold/90 text-cms-green-900 px-4 py-2 text-[13px] font-semibold shadow-cms-sm"
          >
            Jadwal sholat hari ini
          </UButton>
          <UButton
            to="#kegiatan"
            icon="i-lucide-calendar-days"
            variant="outline"
            color="neutral"
            class="rounded-full bg-transparent ring-white/25 text-white hover:bg-white/10 px-4 py-2 text-[13px] font-semibold"
          >
            Lihat kegiatan
          </UButton>
          <UButton
            :to="tp('/transparency')"
            icon="i-lucide-wallet"
            variant="outline"
            color="neutral"
            class="rounded-full bg-transparent ring-white/25 text-white hover:bg-white/10 px-4 py-2 text-[13px] font-semibold"
          >
            Transparansi kas
          </UButton>
        </div>
      </div>
    </section>

    <!-- Prayer card -->
    <section id="jadwal-sholat" class="px-4 pt-6 mb-8">
      <div class="mx-auto max-w-2xl bg-white rounded-cms-lg border border-cms-border shadow-cms overflow-hidden">
        <!-- Next prayer highlight -->
        <div class="p-5 bg-gradient-to-br from-cms-green-50 to-white border-b border-cms-border">
          <div v-if="next" class="flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] uppercase tracking-[1.2px] text-cms-muted font-semibold">
                Sholat selanjutnya
              </div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="font-serif text-[26px] font-semibold text-cms-green-900">
                  {{ next.name }}
                </span>
                <span class="font-arab text-[18px] text-cms-gold-ink">{{ next.ar }}</span>
              </div>
              <div class="text-[12.5px] text-cms-ink-2 mt-1">
                Iqamah <span class="font-semibold">{{ next.iq }}</span> · {{ countdown }}
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="font-mono text-[32px] font-semibold text-cms-green-800 tabular-nums leading-none">
                {{ next.time }}
              </div>
              <div class="text-[11px] uppercase tracking-[1px] text-cms-muted mt-1">
                Adzan
              </div>
            </div>
          </div>
          <div v-else class="text-[13px] text-cms-muted">
            Jadwal sholat belum tersedia.
          </div>
          <div class="mt-3 text-[11px] text-cms-muted-2">
            {{ gregorianDate }} · {{ hijriDate }}<template v-if="sunrise">
              · Terbit {{ sunrise.time }}
            </template>
          </div>
        </div>

        <!-- 5-prayer grid -->
        <ul v-if="prayers.length" class="grid grid-cols-5 divide-x divide-cms-border">
          <li
            v-for="p in prayers"
            :key="p.id"
            class="px-2 py-3 text-center"
            :class="[
              p.isNext ? 'bg-cms-gold-soft' : '',
              p.isCurrent ? 'bg-cms-green-100' : '',
              p.isPassed ? 'opacity-55' : '',
            ]"
          >
            <div
              class="text-[10.5px] uppercase tracking-[0.6px] font-semibold"
              :class="p.isNext ? 'text-cms-gold-ink' : 'text-cms-muted'"
            >
              {{ p.name }}
            </div>
            <div
              class="font-mono text-[14px] font-semibold tabular-nums mt-1"
              :class="p.isNext ? 'text-cms-green-900' : 'text-cms-ink'"
            >
              {{ p.time }}
            </div>
            <div class="text-[10px] text-cms-muted mt-0.5">
              iq {{ p.iq }}
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Announcements -->
    <section v-if="homeAnnouncements.length" id="pengumuman" class="px-4 mb-10">
      <div class="mx-auto max-w-2xl">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon name="lucide:megaphone" size="16" class="text-cms-green-700" />
            <h2 class="font-serif text-[18px] font-semibold">Pengumuman</h2>
          </div>
          <NuxtLink
            v-if="(announcements?.length ?? 0) > ANNOUNCEMENTS_ON_HOME"
            :to="tp('/announcements')"
            class="text-[12px] font-semibold text-cms-green-800 hover:underline underline-offset-4"
          >
            Lihat semua ({{ announcements?.length }})
          </NuxtLink>
        </div>
        <div class="space-y-3">
          <PortalAnnouncementCard v-for="a in homeAnnouncements" :key="a.id" :announcement="a" />
        </div>
      </div>
    </section>

    <!-- Duty roster -->
    <section v-if="duties && (fridayDuties.length || weekDuties.length)" id="petugas" class="px-4 mb-10">
      <div class="mx-auto max-w-2xl">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon name="lucide:users-round" size="16" class="text-cms-green-700" />
            <h2 class="font-serif text-[18px] font-semibold">Petugas Masjid</h2>
          </div>
          <NuxtLink
            :to="tp('/duties')"
            class="text-[12px] font-semibold text-cms-green-800 hover:underline underline-offset-4"
          >
            Jadwal lengkap
          </NuxtLink>
        </div>

        <PortalJumuahCard
          v-if="friday && fridayDuties.length"
          :date="friday"
          :today="duties.today"
          :items="fridayDuties"
          class="mb-4"
        />

        <div v-if="weekDuties.length" class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-cms-border flex items-center justify-between gap-2">
            <div class="text-[13px] font-semibold">Jadwal petugas pekan ini</div>
            <UButton
              :to="tp('/duties')"
              size="xs"
              color="neutral"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
              class="rounded-full shrink-0"
            >
              Lihat semua
            </UButton>
          </div>
          <div class="divide-y divide-cms-border">
            <PortalDutyDay v-for="day in weekDuties" :key="day.date" :day="day" :today="duties.today" compact />
          </div>
        </div>
      </div>
    </section>

    <!-- Profile card -->
    <section v-if="mosque" class="px-4 mb-10">
      <div class="mx-auto max-w-2xl">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="lucide:landmark" size="16" class="text-cms-green-700" />
          <h2 class="font-serif text-[18px] font-semibold">Profil Masjid</h2>
        </div>

        <div class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm divide-y divide-cms-border">
          <component
            :is="mapsUrl ? 'a' : 'div'"
            v-if="addressMain"
            :href="mapsUrl ?? undefined"
            :target="mapsUrl ? '_blank' : undefined"
            :rel="mapsUrl ? 'noopener' : undefined"
            class="p-4 flex items-start gap-3 active:bg-cms-surface-2 transition"
          >
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:map-pin" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Alamat</div>
              <div class="text-[14px] mt-0.5">{{ addressMain }}</div>
              <div v-if="addressSub" class="text-[12.5px] text-cms-muted-2 mt-0.5">{{ addressSub }}</div>
            </div>
            <Icon v-if="mapsUrl" name="lucide:chevron-right" size="16" class="text-cms-muted self-center" />
          </component>

          <a
            v-if="mosque.phone"
            :href="`tel:${mosque.phone.replace(/\s/g, '')}`"
            class="p-4 flex items-start gap-3 active:bg-cms-surface-2 transition"
          >
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:phone" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Telepon DKM</div>
              <div class="text-[14px] mt-0.5 font-medium">{{ mosque.phone }}</div>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="text-cms-muted self-center" />
          </a>

          <a
            v-if="whatsappUrl"
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            class="p-4 flex items-start gap-3 active:bg-cms-surface-2 transition"
          >
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:message-circle" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">WhatsApp</div>
              <div class="text-[14px] mt-0.5 font-medium">{{ mosque.whatsapp }}</div>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="text-cms-muted self-center" />
          </a>

          <a
            v-if="mosque.email"
            :href="`mailto:${mosque.email}`"
            class="p-4 flex items-start gap-3 active:bg-cms-surface-2 transition"
          >
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:mail" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Email</div>
              <div class="text-[14px] mt-0.5 font-medium break-all">{{ mosque.email }}</div>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="text-cms-muted self-center" />
          </a>

          <div v-if="mosque.capacity || mosque.yearFounded" class="p-4 grid grid-cols-2 gap-3">
            <div v-if="mosque.capacity">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Kapasitas</div>
              <div class="text-[14px] mt-0.5 font-medium">{{ mosque.capacity.toLocaleString('id-ID') }} jamaah</div>
            </div>
            <div v-if="mosque.yearFounded">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Berdiri sejak</div>
              <div class="text-[14px] mt-0.5 font-medium">{{ mosque.yearFounded }}</div>
            </div>
          </div>

          <div v-if="socials.length" class="p-4 flex flex-wrap gap-2">
            <UButton
              v-for="s in socials"
              :key="s.label"
              :to="s.url"
              target="_blank"
              rel="noopener"
              :icon="s.icon"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full"
            >
              {{ s.label }}
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Events -->
    <section id="kegiatan" class="px-4 mb-12">
      <div class="mx-auto max-w-2xl">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon name="lucide:calendar-days" size="16" class="text-cms-green-700" />
            <h2 class="font-serif text-[18px] font-semibold">Kegiatan Mendatang</h2>
          </div>
          <span class="text-[12px] text-cms-muted">{{ filteredEvents.length }} kegiatan</span>
        </div>

        <!-- Filter chips -->
        <div v-if="categories.length > 1" class="-mx-4 px-4 mb-4 overflow-x-auto scrollbar-none">
          <div class="flex gap-2 w-max">
            <UButton
              :color="activeFilter === 'all' ? 'primary' : 'neutral'"
              :variant="activeFilter === 'all' ? 'solid' : 'outline'"
              size="sm"
              class="rounded-full px-3.5 text-[12.5px] font-semibold"
              :class="activeFilter === 'all' ? 'bg-cms-green-800 hover:bg-cms-green-800' : 'bg-white text-cms-ink-2'"
              @click="activeFilter = 'all'"
            >
              Semua
            </UButton>
            <UButton
              v-for="c in categories"
              :key="c.slug"
              :color="activeFilter === c.slug ? 'primary' : 'neutral'"
              :variant="activeFilter === c.slug ? 'solid' : 'outline'"
              size="sm"
              class="rounded-full px-3.5 text-[12.5px] font-semibold"
              :class="activeFilter === c.slug ? 'bg-cms-green-800 hover:bg-cms-green-800' : 'bg-white text-cms-ink-2'"
              @click="activeFilter = c.slug"
            >
              <Icon v-if="c.icon" :name="c.icon" size="13" />
              {{ c.name }}
            </UButton>
          </div>
        </div>

        <!-- Event list -->
        <div v-if="eventsPending && !events" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-36 rounded-cms-lg" />
        </div>

        <div v-else-if="filteredEvents.length" class="space-y-3">
          <article
            v-for="ev in filteredEvents"
            :key="ev.id"
            class="relative bg-white rounded-cms-lg border border-cms-border shadow-cms-sm overflow-hidden hover:border-cms-border-strong transition"
          >
            <div class="flex gap-3 p-4">
              <!-- Date block -->
              <div class="shrink-0 w-14 rounded-cms bg-cms-green-50 border border-cms-green-100 text-center py-2">
                <div class="text-[10.5px] uppercase tracking-[0.6px] text-cms-green-700 font-semibold">
                  {{ dateParts(ev.startDate).m }}
                </div>
                <div class="font-serif text-[22px] font-semibold text-cms-green-900 leading-none mt-0.5">
                  {{ dateParts(ev.startDate).d }}
                </div>
                <div class="text-[10px] text-cms-muted mt-1">{{ dateParts(ev.startDate).day }}</div>
              </div>

              <!-- Body -->
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    v-if="ev.category"
                    class="text-[10.5px] uppercase tracking-[0.6px] text-cms-gold-ink font-semibold"
                  >
                    {{ ev.category.name }}
                  </span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.4px]"
                    :class="registrationTone(ev).cls"
                  >
                    {{ registrationTone(ev).label }}
                  </span>
                </div>
                <h3 class="font-serif text-[16px] font-semibold leading-[1.25] mb-1.5">
                  <NuxtLink :to="tp(`/events/${ev.slug}`)" class="hover:text-cms-green-800 after:absolute after:inset-0">
                    {{ ev.title }}
                  </NuxtLink>
                </h3>
                <p v-if="ev.description" class="text-[12.5px] text-cms-ink-2 line-clamp-2 mb-2.5">
                  {{ ev.description }}
                </p>

                <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-cms-muted-2">
                  <span v-if="eventSchedule(ev)" class="inline-flex items-center gap-1">
                    <Icon name="lucide:clock" size="12" />
                    {{ eventSchedule(ev) }}
                  </span>
                  <span v-if="ev.locationName" class="inline-flex items-center gap-1">
                    <Icon name="lucide:map-pin" size="12" />
                    {{ ev.locationName }}<template v-if="ev.locationDetail">
                      · {{ ev.locationDetail }}
                    </template>
                  </span>
                  <span v-if="ev.isLivestream" class="inline-flex items-center gap-1">
                    <Icon name="lucide:radio" size="12" />
                    Siaran langsung
                  </span>
                </div>

                <div
                  v-if="ev.speakers.length || ev.capacity || ev.requiresRegistration"
                  class="mt-2.5 pt-2.5 border-t border-cms-border flex items-center justify-between gap-2"
                >
                  <div class="min-w-0">
                    <template v-if="ev.speakers[0]">
                      <div class="text-[12px] font-semibold truncate">{{ ev.speakers[0].name }}</div>
                      <div v-if="ev.speakers[0].role" class="text-[11px] text-cms-muted truncate">
                        {{ ev.speakers[0].role }}
                      </div>
                    </template>
                    <div v-if="ev.capacity" class="flex items-center gap-1.5" :class="ev.speakers[0] ? 'mt-1.5' : ''">
                      <AdminCapacityBar :attended="ev.registeredCount" :capacity="ev.capacity" />
                      <span class="text-[11px] text-cms-muted">terdaftar</span>
                    </div>
                  </div>
                  <UButton
                    v-if="ev.requiresRegistration && ev.displayStatus !== 'full' && mosque?.isRegistrationOpen !== false"
                    :to="tp(`/events/${ev.slug}`)"
                    size="xs"
                    trailing-icon="i-lucide-arrow-right"
                    class="relative z-10 shrink-0 rounded-full"
                  >
                    Daftar
                  </UButton>
                  <UButton
                    v-else
                    :to="tp(`/events/${ev.slug}`)"
                    size="xs"
                    color="neutral"
                    variant="soft"
                    trailing-icon="i-lucide-arrow-right"
                    class="relative z-10 shrink-0 rounded-full"
                  >
                    Detail
                  </UButton>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div
          v-else
          class="bg-white rounded-cms-lg border border-dashed border-cms-border px-4 py-10 text-center"
        >
          <Icon name="lucide:calendar-x-2" size="22" class="text-cms-muted mx-auto mb-2" />
          <div class="text-[13.5px] font-semibold text-cms-ink-2">Belum ada kegiatan</div>
          <div class="text-[12px] text-cms-muted mt-1">
            {{ activeFilter === 'all' ? 'Belum ada kegiatan terjadwal.' : 'Tidak ada kegiatan terjadwal untuk kategori ini.' }}
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-cms-green-900 text-white/80 mt-4">
      <div class="mx-auto max-w-2xl px-5 py-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-[10px] bg-cms-gold grid place-items-center text-cms-green-900">
            <AdminStarMark :size="22" />
          </div>
          <div>
            <div class="font-serif text-[16px] font-semibold text-white leading-tight">
              {{ mosqueName }}
            </div>
            <NuxtLink to="/" class="block text-[11px] uppercase tracking-[1.2px] text-cms-gold-soft mt-0.5 hover:underline underline-offset-4">
              Powered by OpenMasjid
            </NuxtLink>
          </div>
        </div>
        <p v-if="fullAddress" class="text-[12.5px] leading-relaxed text-white/65 mb-5">
          {{ fullAddress }}
        </p>
        <div class="flex items-center justify-between text-[11px] text-white/55 pt-4 border-t border-white/10">
          <span>© {{ now.getFullYear() }} OpenMasjid</span>
          <span class="font-arab text-[14px] text-cms-gold-2">بَارَكَ اللَّهُ فِيْكُمْ</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { scrollbar-width: none; }
</style>
