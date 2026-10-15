<script setup lang="ts">
import type { CheckInResult } from '~/components/admin/check-in/ResultCard.vue'
import { formatDate } from '~/utils/format'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Check-in — OpenMasjid CMS' })

const api = useApiBase()
const tp = useTenantPath()
const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()
const requestFetch = useRequestFetch()

const LOG_LIMIT = 20

/* ── Event selector (optional) ─────────────────────────────────────── */
const eventId = computed(() => {
  const v = route.query.eventId
  return typeof v === 'string' && v ? v : undefined
})

const [{ data: upcoming }, { data: ongoing }] = await Promise.all([
  useFetch(`${api}/admin/events`, { query: { status: 'upcoming', pageSize: 100 }, key: 'check-in-events-upcoming' }),
  useFetch(`${api}/admin/events`, { query: { status: 'ongoing', pageSize: 100 }, key: 'check-in-events-ongoing' }),
])

const { data: selected, refresh: refreshSelected } = await useAsyncData(
  'check-in-selected-event',
  () => eventId.value
    ? requestFetch(`${api}/admin/events/${eventId.value}`).catch(() => null)
    : Promise.resolve(null),
  { watch: [eventId] },
)

interface EventOption { label: string, value: string, description?: string }
const eventItems = computed<EventOption[]>(() => {
  const seen = new Set<string>()
  const list = [...(ongoing.value?.data ?? []), ...(upcoming.value?.data ?? [])]
    .filter(e => e.status !== 'archived' && !seen.has(e.id) && seen.add(e.id))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const items: EventOption[] = [
    { label: 'Semua kegiatan', value: 'all', description: 'Terima tiket kegiatan mana pun' },
    ...list.map(e => ({ label: e.title, value: e.id, description: formatDate(e.startDate) })),
  ]
  // Keep a preselected event (e.g. a past one opened from its detail page) selectable.
  if (selected.value && !seen.has(selected.value.id))
    items.push({ label: selected.value.title, value: selected.value.id, description: formatDate(selected.value.startDate) })
  return items
})

const eventModel = computed({
  get: () => eventId.value ?? 'all',
  set: (v: string) => {
    router.replace({ query: { ...route.query, eventId: v === 'all' ? undefined : v } })
  },
})

/* ── Check-in ──────────────────────────────────────────────────────── */
const busy = ref(false)
const result = ref<CheckInResult | null>(null)
const log = ref<CheckInResult[]>([])
const manualCode = ref('')
const manualInput = useTemplateRef<{ inputRef?: HTMLInputElement }>('manualInput')
let nextId = 1

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  }
  catch { /* unsupported */ }
}

async function checkIn(raw: string) {
  const code = raw.trim()
  if (!code || busy.value) return
  busy.value = true
  const base = { id: nextId++, at: new Date(), code }
  let entry: CheckInResult
  try {
    const res = await $fetch(`${api}/admin/check-in`, {
      method: 'POST',
      body: { code, eventId: eventId.value },
    })
    entry = {
      ...base,
      kind: res.alreadyCheckedIn ? 'already' : 'success',
      attendee: res.attendee,
      event: res.event,
      attendedAt: String(res.attendedAt),
    }
    vibrate(res.alreadyCheckedIn ? [60, 60, 60] : 120)
    if (!res.alreadyCheckedIn && eventId.value) refreshSelected()
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string, data?: { issues?: unknown } }, statusCode?: number }
    const message = e.statusCode === 400
      ? 'Format kode tiket tidak valid'
      : e.data?.statusMessage ?? 'Terjadi kesalahan, coba lagi'
    entry = { ...base, kind: 'error', message }
    vibrate([60, 40, 60, 40, 60])
  }
  finally {
    busy.value = false
  }
  result.value = entry
  log.value = [entry, ...log.value].slice(0, LOG_LIMIT)
}

async function submitManual() {
  if (busy.value) return
  const code = manualCode.value
  manualCode.value = ''
  await checkIn(code)
  manualInput.value?.inputRef?.focus()
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Kehadiran Jamaah"
      title="Check-in Kegiatan"
      description="Pindai kode QR pada e-tiket jamaah atau ketik kodenya untuk mencatat kehadiran."
    >
      <template #actions>
        <UButton
          :to="{ path: tp('/admin/registrants'), query: eventId ? { eventId } : {} }"
          color="neutral"
          variant="outline"
          icon="i-lucide-users"
          class="font-semibold"
        >
          Daftar Pendaftar
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Event filter + counts -->
    <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-5 mb-[18px] flex flex-col lg:flex-row lg:items-end gap-4">
      <div class="flex-1 min-w-0">
        <label for="check-in-event" class="block text-[12px] uppercase tracking-[0.4px] font-semibold text-cms-muted mb-1.5">
          Kegiatan
        </label>
        <USelectMenu
          id="check-in-event"
          v-model="eventModel"
          :items="eventItems"
          value-key="value"
          :search-input="{ placeholder: 'Cari kegiatan…' }"
          class="w-full"
          size="lg"
          icon="i-lucide-calendar"
        />
        <p class="m-0 mt-1.5 text-[12px] text-cms-muted">
          {{ eventId ? 'Hanya tiket untuk kegiatan ini yang diterima.' : 'Pilih kegiatan agar tiket kegiatan lain ditolak.' }}
        </p>
      </div>
      <div v-if="selected" class="grid grid-cols-3 gap-3 lg:w-[420px] shrink-0">
        <div class="rounded-cms bg-cms-surface-2 border border-cms-border p-3">
          <div class="text-[11px] uppercase tracking-[0.4px] font-semibold text-cms-muted">Pendaftar</div>
          <div class="font-serif text-[24px] font-semibold" data-testid="registered-count">{{ selected.registeredCount }}</div>
        </div>
        <div class="rounded-cms bg-cms-green-50 border border-cms-green-300 p-3">
          <div class="text-[11px] uppercase tracking-[0.4px] font-semibold text-cms-green-700">Hadir</div>
          <div class="font-serif text-[24px] font-semibold text-cms-green-800" data-testid="attended-count">{{ selected.attendedCount }}</div>
        </div>
        <div class="rounded-cms bg-cms-surface-2 border border-cms-border p-3">
          <div class="text-[11px] uppercase tracking-[0.4px] font-semibold text-cms-muted">Belum hadir</div>
          <div class="font-serif text-[24px] font-semibold">{{ Math.max(0, selected.registeredCount - selected.attendedCount) }}</div>
        </div>
      </div>
    </div>

    <UAlert
      v-if="!isAdmin"
      color="neutral"
      variant="subtle"
      icon="i-lucide-eye"
      title="Mode lihat saja"
      description="Akun Anda hanya dapat melihat data. Pemindaian tiket dan pencatatan kehadiran hanya dapat dilakukan oleh admin DKM."
      class="mb-[18px]"
    />

    <div v-else class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[18px] items-start">
      <ClientOnly>
        <AdminCheckInScanner :paused="busy" @detect="checkIn" />
        <template #fallback>
          <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-5 aspect-[4/3]" />
        </template>
      </ClientOnly>

      <div class="flex flex-col gap-[18px]">
        <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-5">
          <h3 class="font-serif text-[17px] font-semibold m-0 mb-1 flex items-center gap-2">
            <Icon name="lucide:keyboard" size="18" class="text-cms-green-700" />
            Masukkan Kode Tiket
          </h3>
          <p class="m-0 mb-3 text-[12px] text-cms-muted">
            Ketik atau tempel kode tiket, lalu tekan Enter. Pemindai barcode USB/Bluetooth juga bisa dipakai di kolom ini.
          </p>
          <form class="flex gap-2" @submit.prevent="submitManual">
            <UInput
              ref="manualInput"
              v-model="manualCode"
              name="code"
              placeholder="om1.…"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              icon="i-lucide-ticket"
              size="lg"
              class="flex-1 min-w-0"
              aria-label="Kode tiket"
            />
            <UButton type="submit" size="lg" icon="i-lucide-check" :loading="busy" :disabled="!manualCode.trim()">
              Check-in
            </UButton>
          </form>
        </div>

        <AdminCheckInResultCard v-if="result" :key="result.id" :result="result" />

        <AdminCheckInScanLog :items="log" />
      </div>
    </div>
  </div>
</template>
