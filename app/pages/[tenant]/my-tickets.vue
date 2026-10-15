<script setup lang="ts">
import { REGISTRANT_STATUS_LABELS } from '#shared/utils/events'
import { dateParts, formatDate, formatTimeRange, timeAgo } from '~/utils/format'

definePageMeta({ layout: false })

const api = useApiBase()
const tp = useTenantPath()
const route = useRoute()
const toast = useToast()
const { user } = useAuth()
const { tenant } = useTenantContext()

// Member-only page: route middleware does not guard it, so redirect here.
if (!user.value) {
  await navigateTo({ path: tp('/auth/login'), query: { redirect: route.fullPath } }, { replace: true })
}

useHead({
  title: () => `Tiket saya — ${tenant.value?.name ?? 'OpenMasjid'}`,
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#1f3b2d' },
  ],
})

const { data, pending, error, refresh } = await useFetch(`${api}/me/registrations`, {
  key: 'my-registrations',
  immediate: !!user.value,
})

// Reload when the account changes (the header menu handles sign-out navigation).
watch(() => user.value?.id, (id) => {
  if (id) refresh()
})

type Registration = NonNullable<typeof data.value>[number]

const upcoming = computed(() => (data.value ?? [])
  .filter(r => !r.isPast && r.status !== 'cancelled')
  .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate) || (a.event.startTime ?? '').localeCompare(b.event.startTime ?? '')))
const history = computed(() => (data.value ?? [])
  .filter(r => r.isPast || r.status === 'cancelled')
  .sort((a, b) => b.event.startDate.localeCompare(a.event.startDate)))

function scheduleLabel(r: Registration) {
  const e = r.event
  const d = e.endDate && e.endDate !== e.startDate ? `${formatDate(e.startDate)} – ${formatDate(e.endDate)}` : formatDate(e.startDate)
  const t = formatTimeRange(e.startTime, e.endTime)
  return t ? `${d} · ${t}` : d
}

function statusTone(r: Registration) {
  if (r.status === 'cancelled') return 'bg-cms-surface-2 text-cms-muted'
  if (r.status === 'attended') return 'bg-cms-info-soft text-cms-info'
  return 'bg-cms-green-100 text-cms-green-800'
}
function historyLabel(r: Registration) {
  if (r.status === 'confirmed' && r.isPast) return 'Tidak hadir'
  return REGISTRANT_STATUS_LABELS[r.status]
}

// Fullscreen ticket for scanning at the door.
const shown = ref<Registration | null>(null)
const showOpen = computed({
  get: () => !!shown.value,
  set: (v) => { if (!v) shown.value = null },
})

const toCancel = ref<Registration | null>(null)
const cancelOpen = computed({
  get: () => !!toCancel.value,
  set: (v) => { if (!v) toCancel.value = null },
})
const cancelling = ref(false)
async function onCancel() {
  const r = toCancel.value
  if (!r) return
  cancelling.value = true
  try {
    await $fetch(`${api}/public/events/${r.event.slug}/cancel`, { method: 'POST' })
    toast.add({ title: 'Pendaftaran dibatalkan', description: r.event.title, icon: 'i-lucide-calendar-x-2', color: 'neutral' })
    toCancel.value = null
  }
  catch (e) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({ title: 'Gagal membatalkan', description: err.data?.statusMessage || err.statusMessage || 'Coba lagi beberapa saat.', icon: 'i-lucide-alert-circle', color: 'error' })
  }
  finally {
    cancelling.value = false
    await refresh()
  }
}
</script>

<template>
  <div class="min-h-screen bg-cms-bg text-cms-ink font-sans antialiased">
    <PortalHeader subtitle="Tiket saya" />

    <section class="relative overflow-hidden cms-hero-grad text-white">
      <div class="absolute inset-0 cms-pattern-khatam opacity-[0.18] pointer-events-none" />
      <div class="relative mx-auto max-w-2xl px-5 pt-7 pb-8">
        <div class="text-[11px] uppercase tracking-[2px] text-cms-gold-soft font-semibold mb-2">
          Akun jamaah
        </div>
        <h1 class="font-serif text-[26px] leading-tight font-semibold">
          Tiket saya
        </h1>
        <p v-if="user" class="text-[13.5px] text-white/80 mt-1.5">
          {{ user.name }} · {{ user.email }}
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-2xl px-4 py-6 pb-12 space-y-8">
      <div v-if="pending && !data" class="space-y-3">
        <USkeleton v-for="i in 2" :key="i" class="h-40 rounded-cms-lg" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        title="Gagal memuat tiket"
        description="Muat ulang halaman atau coba lagi beberapa saat."
      />

      <template v-else-if="data">
        <!-- Upcoming -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Icon name="lucide:ticket" size="16" class="text-cms-green-700" />
              <h2 class="font-serif text-[18px] font-semibold">Kegiatan mendatang</h2>
            </div>
            <span class="text-[12px] text-cms-muted">{{ upcoming.length }} tiket</span>
          </div>

          <div v-if="upcoming.length" class="space-y-4">
            <article
              v-for="r in upcoming"
              :key="r.id"
              class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm overflow-hidden"
            >
              <div class="flex gap-3 p-4">
                <div class="shrink-0 w-14 rounded-cms bg-cms-green-50 border border-cms-green-100 text-center py-2">
                  <div class="text-[10.5px] uppercase tracking-[0.6px] text-cms-green-700 font-semibold">
                    {{ dateParts(r.event.startDate).m }}
                  </div>
                  <div class="font-serif text-[22px] font-semibold text-cms-green-900 leading-none mt-0.5">
                    {{ dateParts(r.event.startDate).d }}
                  </div>
                  <div class="text-[10px] text-cms-muted mt-1">{{ dateParts(r.event.startDate).day }}</div>
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.4px]" :class="statusTone(r)">
                    {{ REGISTRANT_STATUS_LABELS[r.status] }}
                  </span>
                  <NuxtLink :to="tp(`/events/${r.event.slug}`)" class="block font-serif text-[16px] font-semibold leading-[1.25] mt-1.5 hover:text-cms-green-800">
                    {{ r.event.title }}
                  </NuxtLink>
                  <div class="text-[12px] text-cms-muted-2 mt-1">{{ scheduleLabel(r) }}</div>
                  <div v-if="r.event.locationName" class="text-[12px] text-cms-muted-2 inline-flex items-center gap-1 mt-0.5">
                    <Icon name="lucide:map-pin" size="12" /> {{ r.event.locationName }}
                  </div>
                </div>
              </div>

              <div v-if="r.ticket" class="px-4 pb-4">
                <PortalTicketQr
                  :code="r.ticket"
                  :title="r.event.title"
                  :start-date="r.event.startDate"
                  :end-date="r.event.endDate"
                  :start-time="r.event.startTime"
                  :end-time="r.event.endTime"
                  :attendee-name="user?.name"
                  :status="r.status"
                />
              </div>

              <div class="px-4 py-3 border-t border-cms-border bg-cms-surface-2/60 flex flex-wrap items-center gap-2">
                <UButton
                  v-if="r.ticket"
                  size="sm"
                  icon="i-lucide-maximize-2"
                  class="rounded-full"
                  @click="shown = r"
                >
                  Tampilkan layar penuh
                </UButton>
                <UButton :to="tp(`/events/${r.event.slug}`)" size="sm" color="neutral" variant="outline" icon="i-lucide-info" class="rounded-full">
                  Detail
                </UButton>
                <UButton
                  v-if="r.status === 'confirmed'"
                  size="sm"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-x"
                  class="rounded-full ml-auto"
                  @click="toCancel = r"
                >
                  Batalkan
                </UButton>
              </div>
            </article>
          </div>

          <div v-else class="bg-white rounded-cms-lg border border-dashed border-cms-border px-4 py-10 text-center">
            <Icon name="lucide:ticket-x" size="22" class="text-cms-muted mx-auto mb-2" />
            <div class="text-[13.5px] font-semibold text-cms-ink-2">Belum ada tiket aktif</div>
            <div class="text-[12px] text-cms-muted mt-1 mb-4">Daftar kegiatan masjid untuk mendapatkan tiket QR.</div>
            <UButton :to="`${tp('/')}#kegiatan`" size="sm" icon="i-lucide-calendar-days" class="rounded-full">
              Lihat kegiatan
            </UButton>
          </div>
        </section>

        <!-- History -->
        <section v-if="history.length">
          <div class="flex items-center gap-2 mb-3">
            <Icon name="lucide:history" size="16" class="text-cms-green-700" />
            <h2 class="font-serif text-[18px] font-semibold">Riwayat</h2>
          </div>
          <ul class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm divide-y divide-cms-border">
            <li v-for="r in history" :key="r.id">
              <NuxtLink :to="tp(`/events/${r.event.slug}`)" class="p-4 flex items-center gap-3 active:bg-cms-surface-2 hover:bg-cms-surface-2/60 transition">
                <div class="min-w-0 flex-1">
                  <div class="text-[14px] font-semibold truncate" :class="r.status === 'cancelled' ? 'text-cms-muted' : ''">
                    {{ r.event.title }}
                  </div>
                  <div class="text-[12px] text-cms-muted-2 mt-0.5">
                    {{ scheduleLabel(r) }}
                  </div>
                  <div v-if="r.status === 'attended' && r.attendedAt" class="text-[11.5px] text-cms-muted mt-0.5">
                    Hadir · {{ timeAgo(r.attendedAt) }}
                  </div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.4px] shrink-0" :class="statusTone(r)">
                  {{ historyLabel(r) }}
                </span>
                <Icon name="lucide:chevron-right" size="16" class="text-cms-muted shrink-0" />
              </NuxtLink>
            </li>
          </ul>
        </section>
      </template>
    </div>

    <UModal v-model:open="showOpen" :title="shown?.event.title ?? 'Tiket'" description="Arahkan layar ini ke pemindai panitia.">
      <template #body>
        <PortalTicketQr
          v-if="shown?.ticket"
          :code="shown.ticket"
          :title="shown.event.title"
          :start-date="shown.event.startDate"
          :end-date="shown.event.endDate"
          :start-time="shown.event.startTime"
          :end-time="shown.event.endTime"
          :attendee-name="user?.name"
          :status="shown.status"
          large
        />
      </template>
    </UModal>

    <UModal
      v-model:open="cancelOpen"
      title="Batalkan pendaftaran?"
      :description="toCancel ? `Tiket untuk “${toCancel.event.title}” tidak berlaku lagi. Anda bisa mendaftar ulang selama kuota masih tersedia.` : undefined"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Kembali" @click="toCancel = null" />
          <UButton color="error" icon="i-lucide-x" label="Batalkan pendaftaran" :loading="cancelling" @click="onCancel" />
        </div>
      </template>
    </UModal>
  </div>
</template>
