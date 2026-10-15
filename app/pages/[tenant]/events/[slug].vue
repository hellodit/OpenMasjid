<script setup lang="ts">
import { REGISTRATION_AVAILABILITY_LABELS } from '#shared/utils/events'
import { bannerClass, formatDate, formatTime, formatTimeRange, initials, timeAgo } from '~/utils/format'

definePageMeta({ layout: false })

const api = useApiBase()
const tp = useTenantPath()
const route = useRoute()
const toast = useToast()
const { user } = useAuth()
const { tenant } = useTenantContext()

const eventSlug = computed(() => String(route.params.slug ?? ''))

const { data, error, refresh } = await useFetch(`${api}/public/events/${eventSlug.value}`, {
  key: `portal-event:${eventSlug.value}`,
})

if (error.value || !data.value) {
  const notFound = !error.value || error.value.statusCode === 404
  throw createError({
    statusCode: notFound ? 404 : (error.value?.statusCode ?? 500),
    statusMessage: notFound ? 'Kegiatan tidak ditemukan' : 'Gagal memuat kegiatan',
    fatal: true,
  })
}

// Signing in/out from the header changes `myRegistration`.
watch(() => user.value?.id, () => refresh())

const ev = computed(() => data.value!.event)
const reg = computed(() => data.value!.myRegistration)
const availability = computed(() => data.value!.availability)

useHead({
  title: () => `${ev.value.title} — ${tenant.value?.name ?? 'OpenMasjid'}`,
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#1f3b2d' },
    { name: 'description', content: () => ev.value.description?.slice(0, 160) ?? `Kegiatan di ${tenant.value?.name ?? 'masjid'}.` },
  ],
})

const dateLabel = computed(() => ev.value.endDate && ev.value.endDate !== ev.value.startDate
  ? `${formatDate(ev.value.startDate)} – ${formatDate(ev.value.endDate)}`
  : formatDate(ev.value.startDate))
const timeLabel = computed(() => formatTimeRange(ev.value.startTime, ev.value.endTime))

const capacityPct = computed(() => ev.value.capacity
  ? Math.min(100, Math.round((data.value!.registeredCount / ev.value.capacity) * 100))
  : 0)
const capacityFill = computed(() => capacityPct.value >= 100 ? 'bg-cms-rose' : capacityPct.value >= 80 ? 'bg-cms-gold' : 'bg-cms-green-700')

const selfPath = computed(() => route.fullPath)
const loginTo = computed(() => ({ path: tp('/auth/login'), query: { redirect: selfPath.value } }))
const registerTo = computed(() => ({ path: tp('/auth/register'), query: { redirect: selfPath.value } }))

/** Which registration card to render. */
const panel = computed<'attended' | 'registered' | 'register' | 'signin' | 'unavailable'>(() => {
  if (reg.value?.status === 'attended') return 'attended'
  if (reg.value?.status === 'confirmed') return 'registered'
  if (availability.value === 'open') return user.value ? 'register' : 'signin'
  return 'unavailable'
})

const unavailableIcon = computed(() => ({
  'not-required': 'i-lucide-door-open',
  'closed': 'i-lucide-lock',
  'full': 'i-lucide-users',
  'past': 'i-lucide-calendar-check',
  'open': 'i-lucide-check',
} as const)[availability.value])
const unavailableHint = computed(() => ({
  'not-required': 'Kegiatan ini tidak memerlukan pendaftaran. Silakan langsung hadir di lokasi.',
  'closed': 'Pendaftaran untuk kegiatan ini sedang tidak dibuka.',
  'full': 'Seluruh kuota sudah terisi. Pantau terus, kuota bisa terbuka bila ada pembatalan.',
  'past': 'Terima kasih atas antusiasme jamaah. Nantikan kegiatan berikutnya.',
  'open': '',
} as const)[availability.value])

function errMessage(e: unknown, fallback: string) {
  const err = e as { data?: { statusMessage?: string, message?: string }, statusMessage?: string }
  return err.data?.statusMessage || err.data?.message || err.statusMessage || fallback
}

const registering = ref(false)
async function onRegister() {
  registering.value = true
  try {
    await $fetch(`${api}/public/events/${eventSlug.value}/register`, { method: 'POST' })
    toast.add({ title: 'Pendaftaran berhasil', description: 'Tiket QR Anda sudah tersedia.', icon: 'i-lucide-ticket-check', color: 'success' })
  }
  catch (e) {
    const status = (e as { statusCode?: number }).statusCode
    if (status === 401) {
      await navigateTo(loginTo.value)
      return
    }
    toast.add({ title: 'Gagal mendaftar', description: errMessage(e, 'Coba lagi beberapa saat.'), icon: 'i-lucide-alert-circle', color: 'error' })
  }
  finally {
    registering.value = false
    await refresh()
  }
}

const confirmCancel = ref(false)
const cancelling = ref(false)
async function onCancel() {
  cancelling.value = true
  try {
    await $fetch(`${api}/public/events/${eventSlug.value}/cancel`, { method: 'POST' })
    confirmCancel.value = false
    toast.add({ title: 'Pendaftaran dibatalkan', icon: 'i-lucide-calendar-x-2', color: 'neutral' })
  }
  catch (e) {
    toast.add({ title: 'Gagal membatalkan', description: errMessage(e, 'Coba lagi beberapa saat.'), icon: 'i-lucide-alert-circle', color: 'error' })
  }
  finally {
    cancelling.value = false
    await refresh()
  }
}
</script>

<template>
  <div class="min-h-screen bg-cms-bg text-cms-ink font-sans antialiased">
    <PortalHeader subtitle="Detail kegiatan" :back-to="`${tp('/')}#kegiatan`" />

    <!-- Hero -->
    <section class="relative overflow-hidden text-white" :class="ev.bannerUrl ? 'bg-cms-green-900' : bannerClass(data!.category?.slug)">
      <img
        v-if="ev.bannerUrl"
        :src="ev.bannerUrl"
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-45"
      >
      <div class="absolute inset-0 cms-pattern-khatam opacity-[0.18] pointer-events-none" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
      <div class="relative mx-auto max-w-2xl px-5 pt-8 pb-9">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span
            v-if="data!.category"
            class="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[1.2px] font-semibold text-cms-gold-soft"
          >
            <Icon v-if="data!.category.icon" :name="data!.category.icon" size="13" />
            {{ data!.category.name }}
          </span>
          <span
            v-if="ev.displayStatus === 'ongoing'"
            class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.4px] bg-cms-gold text-cms-green-900"
          >
            Sedang berjalan
          </span>
        </div>
        <div v-if="ev.arabicTitle" class="font-arab text-[26px] leading-tight text-cms-gold mb-2" dir="rtl" lang="ar">
          {{ ev.arabicTitle }}
        </div>
        <h1 class="font-serif text-[26px] sm:text-[32px] leading-[1.15] font-semibold">
          {{ ev.title }}
        </h1>
        <div class="mt-4 flex flex-col gap-1.5 text-[13.5px] text-white/85">
          <span class="inline-flex items-center gap-2">
            <Icon name="lucide:calendar-days" size="15" class="text-cms-gold-soft" />
            {{ dateLabel }}
          </span>
          <span v-if="timeLabel" class="inline-flex items-center gap-2">
            <Icon name="lucide:clock" size="15" class="text-cms-gold-soft" />
            {{ timeLabel }}
          </span>
          <span v-if="ev.locationName" class="inline-flex items-center gap-2">
            <Icon name="lucide:map-pin" size="15" class="text-cms-gold-soft" />
            {{ ev.locationName }}<template v-if="ev.locationDetail"> · {{ ev.locationDetail }}</template>
          </span>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-2xl px-4 -mt-4 relative pb-12 space-y-4">
      <!-- Registration card -->
      <section class="bg-white rounded-cms-lg border border-cms-border shadow-cms p-5">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="lucide:ticket" size="16" class="text-cms-green-700" />
          <h2 class="font-serif text-[17px] font-semibold">Pendaftaran</h2>
        </div>

        <div v-if="ev.capacity" class="mb-4">
          <div class="flex items-center justify-between text-[12.5px] mb-1.5">
            <span class="text-cms-muted">Kuota terisi</span>
            <span class="font-semibold tabular-nums">{{ data!.registeredCount }} / {{ ev.capacity }}</span>
          </div>
          <div class="h-2 rounded-full bg-cms-green-100 overflow-hidden">
            <div class="h-full rounded-full transition-all" :class="capacityFill" :style="{ width: `${capacityPct}%` }" />
          </div>
        </div>

        <!-- Attended -->
        <div v-if="panel === 'attended'" class="rounded-cms bg-cms-info-soft p-4 flex gap-3">
          <Icon name="lucide:badge-check" size="22" class="text-cms-info shrink-0" />
          <div>
            <div class="font-semibold text-[14px]">Kehadiran tercatat</div>
            <div class="text-[12.5px] text-cms-ink-2 mt-0.5">
              Jazakumullah khairan telah hadir<template v-if="reg?.attendedAt"> · dicatat {{ timeAgo(reg.attendedAt) }}</template>.
            </div>
          </div>
        </div>

        <!-- Registered -->
        <div v-else-if="panel === 'registered'" class="space-y-4">
          <div class="rounded-cms bg-cms-green-50 border border-cms-green-100 p-4 flex gap-3">
            <Icon name="lucide:circle-check" size="22" class="text-cms-green-700 shrink-0" />
            <div>
              <div class="font-semibold text-[14px] text-cms-green-900">Anda terdaftar</div>
              <div class="text-[12.5px] text-cms-ink-2 mt-0.5">
                Simpan tiket di bawah dan tunjukkan ke panitia saat tiba.
              </div>
            </div>
          </div>
          <PortalTicketQr
            v-if="reg?.ticket"
            :code="reg.ticket"
            :title="ev.title"
            :start-date="ev.startDate"
            :end-date="ev.endDate"
            :start-time="ev.startTime"
            :end-time="ev.endTime"
            :attendee-name="user?.name"
            status="confirmed"
          />
          <div class="flex flex-wrap gap-2">
            <UButton :to="tp('/my-tickets')" color="neutral" variant="outline" icon="i-lucide-ticket" class="rounded-full">
              Semua tiket saya
            </UButton>
            <UButton
              v-if="availability !== 'past'"
              color="error"
              variant="ghost"
              icon="i-lucide-x"
              class="rounded-full"
              @click="confirmCancel = true"
            >
              Batalkan pendaftaran
            </UButton>
          </div>
        </div>

        <!-- Open, signed in -->
        <div v-else-if="panel === 'register'" class="space-y-3">
          <UAlert
            v-if="reg?.status === 'cancelled'"
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
            description="Pendaftaran Anda sebelumnya dibatalkan. Anda bisa mendaftar lagi selama kuota masih tersedia."
          />
          <p class="text-[13px] text-cms-ink-2">
            Mendaftar sebagai <span class="font-semibold">{{ user?.name }}</span>. Tiket QR akan langsung tersedia setelah mendaftar.
          </p>
          <UButton size="lg" block icon="i-lucide-calendar-check" :loading="registering" @click="onRegister">
            Daftar sekarang
          </UButton>
        </div>

        <!-- Open, signed out -->
        <div v-else-if="panel === 'signin'" class="space-y-3">
          <p class="text-[13px] text-cms-ink-2">
            {{ REGISTRATION_AVAILABILITY_LABELS.open }}. Masuk dengan akun jamaah {{ tenant?.name }} untuk mendapatkan tiket QR.
          </p>
          <UButton :to="loginTo" size="lg" block icon="i-lucide-log-in">
            Masuk untuk mendaftar
          </UButton>
          <p class="text-[13px] text-cms-muted text-center">
            Belum punya akun?
            <NuxtLink :to="registerTo" class="font-semibold text-cms-green-700 hover:text-cms-green-800">
              Daftar
            </NuxtLink>
          </p>
        </div>

        <!-- Not available -->
        <div v-else class="rounded-cms bg-cms-surface-2 p-4 flex gap-3">
          <UIcon :name="unavailableIcon" class="size-5 text-cms-muted shrink-0 mt-0.5" />
          <div>
            <div class="font-semibold text-[14px]">
              {{ availability === 'not-required' ? 'Terbuka untuk umum' : REGISTRATION_AVAILABILITY_LABELS[availability] }}
            </div>
            <div class="text-[12.5px] text-cms-ink-2 mt-0.5">{{ unavailableHint }}</div>
          </div>
        </div>
      </section>

      <!-- Livestream -->
      <a
        v-if="ev.livestreamUrl"
        :href="ev.livestreamUrl"
        target="_blank"
        rel="noopener"
        class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm p-4 flex items-center gap-3 active:bg-cms-surface-2 transition"
      >
        <div class="w-10 h-10 rounded-cms bg-cms-rose-soft text-cms-rose grid place-items-center shrink-0">
          <Icon name="lucide:radio" size="18" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[14px] font-semibold">Tonton siaran langsung</div>
          <div class="text-[12px] text-cms-muted truncate">{{ ev.livestreamUrl }}</div>
        </div>
        <Icon name="lucide:external-link" size="16" class="text-cms-muted" />
      </a>

      <!-- Description -->
      <section v-if="ev.description" class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm p-5">
        <h2 class="font-serif text-[17px] font-semibold mb-2">Tentang kegiatan</h2>
        <p class="text-[14px] leading-relaxed text-cms-ink-2 whitespace-pre-line">{{ ev.description }}</p>
        <p v-if="ev.addressFull" class="mt-3 text-[12.5px] text-cms-muted inline-flex items-start gap-1.5">
          <Icon name="lucide:map-pin" size="13" class="mt-0.5 shrink-0" />
          {{ ev.addressFull }}
        </p>
      </section>

      <!-- Speakers -->
      <section v-if="data!.speakers.length" class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm p-5">
        <h2 class="font-serif text-[17px] font-semibold mb-3">Pemateri</h2>
        <ul class="space-y-3">
          <li v-for="(s, i) in data!.speakers" :key="i" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-cms-green-100 text-cms-green-800 grid place-items-center font-semibold text-[13px] shrink-0">
              {{ initials(s.name) || '?' }}
            </div>
            <div class="min-w-0">
              <div class="text-[14px] font-semibold truncate">{{ s.name }}</div>
              <div v-if="s.role" class="text-[12px] text-cms-muted truncate">{{ s.role }}</div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Agenda -->
      <section v-if="data!.agenda.length" class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm p-5">
        <h2 class="font-serif text-[17px] font-semibold mb-3">Susunan acara</h2>
        <ol class="relative border-l border-cms-green-100 ml-1.5 space-y-4">
          <li v-for="(a, i) in data!.agenda" :key="i" class="pl-4 relative">
            <span class="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-cms-green-700 ring-2 ring-white" />
            <div v-if="a.startTime || a.endTime" class="font-mono text-[12px] text-cms-gold-ink font-semibold tabular-nums">
              {{ a.startTime ? formatTimeRange(a.startTime, a.endTime) : `s.d. ${formatTime(a.endTime)}` }}
            </div>
            <div class="text-[14px] font-semibold">{{ a.title }}</div>
            <div v-if="a.person" class="text-[12px] text-cms-muted">{{ a.person }}</div>
          </li>
        </ol>
      </section>

      <div v-if="ev.tags?.length" class="flex flex-wrap gap-1.5">
        <UBadge v-for="t in ev.tags" :key="t" color="neutral" variant="outline" size="sm" class="rounded-full">
          {{ t }}
        </UBadge>
      </div>
    </div>

    <UModal
      v-model:open="confirmCancel"
      title="Batalkan pendaftaran?"
      description="Tiket QR Anda tidak berlaku lagi. Anda bisa mendaftar ulang selama kuota masih tersedia."
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Kembali" @click="confirmCancel = false" />
          <UButton color="error" icon="i-lucide-x" label="Batalkan pendaftaran" :loading="cancelling" @click="onCancel" />
        </div>
      </template>
    </UModal>
  </div>
</template>
