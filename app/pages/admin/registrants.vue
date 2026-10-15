<script setup lang="ts">
import { REGISTRANT_STATUS_LABELS, type RegistrantStatus } from '#shared/utils/events'
import type { RegistrantAction, RegistrantRow } from '~/components/admin/registrants/Table.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Pendaftar — OpenMasjid CMS' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { isAdmin } = useAuth()

const PAGE_SIZE = 20
const STATUSES = Object.keys(REGISTRANT_STATUS_LABELS) as RegistrantStatus[]

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined)

/* ── Filters live in the URL query ─────────────────────────────────── */
const eventId = computed(() => str(route.query.eventId))
const status = computed(() => {
  const s = str(route.query.status)
  return s && (STATUSES as string[]).includes(s) ? (s as RegistrantStatus) : undefined
})
const q = computed(() => str(route.query.q))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

function setQuery(patch: Record<string, string | number | undefined>) {
  const next: Record<string, string> = {}
  const merged = { eventId: eventId.value, status: status.value, q: q.value, page: page.value > 1 ? page.value : undefined, ...patch }
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== '' && !(k === 'page' && Number(v) <= 1)) next[k] = String(v)
  }
  router.replace({ query: next })
}

/* Search box: local input, debounced into the URL. */
const search = ref(q.value ?? '')
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, (v) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => setQuery({ q: v.trim() || undefined, page: undefined }), 300)
})
watch(q, (v) => {
  if ((v ?? '') !== search.value.trim()) search.value = v ?? ''
})

/* ── Event filter options ──────────────────────────────────────────── */
const { data: eventList } = await useFetch('/api/admin/events', { query: { pageSize: 100 }, key: 'registrants-event-options' })
const eventItems = computed(() => [
  { label: 'Semua kegiatan', value: 'all' },
  ...(eventList.value?.data ?? []).map(e => ({ label: e.title, value: e.id })),
])
const eventModel = computed({
  get: () => eventId.value ?? 'all',
  set: (v: string) => setQuery({ eventId: v === 'all' ? undefined : v, page: undefined }),
})

/* ── Registrant list ───────────────────────────────────────────────── */
const listQuery = computed(() => ({
  eventId: eventId.value,
  status: status.value,
  q: q.value,
  page: page.value,
  pageSize: PAGE_SIZE,
}))
const { data, status: fetchStatus, refresh } = await useFetch('/api/admin/registrants', { query: listQuery })

/* Summary counts (scoped to the selected event): pageSize=1 → read pagination.total. */
const countQuery = (s?: RegistrantStatus) => computed(() => ({ eventId: eventId.value, status: s, pageSize: 1 }))
const [allCount, confirmedCount, attendedCount, cancelledCount] = await Promise.all([
  useFetch('/api/admin/registrants', { query: countQuery(), key: 'registrants-count-all' }),
  useFetch('/api/admin/registrants', { query: countQuery('confirmed'), key: 'registrants-count-confirmed' }),
  useFetch('/api/admin/registrants', { query: countQuery('attended'), key: 'registrants-count-attended' }),
  useFetch('/api/admin/registrants', { query: countQuery('cancelled'), key: 'registrants-count-cancelled' }),
])
const counts = computed(() => ({
  all: allCount.data.value?.pagination.total ?? 0,
  confirmed: confirmedCount.data.value?.pagination.total ?? 0,
  attended: attendedCount.data.value?.pagination.total ?? 0,
  cancelled: cancelledCount.data.value?.pagination.total ?? 0,
}))
const pct = (n: number) => counts.value.all ? `${Math.round((n / counts.value.all) * 100)}% dari total` : undefined

const filters = computed(() => [
  { id: undefined, label: 'Semua', count: counts.value.all },
  ...STATUSES.map(s => ({ id: s, label: REGISTRANT_STATUS_LABELS[s], count: counts.value[s] })),
])

const rows = computed(() => data.value?.data ?? [])
const pagination = computed(() => data.value?.pagination)

/* ── Row actions ───────────────────────────────────────────────────── */
const busyId = ref<string | null>(null)
const ACTION_TOAST: Record<RegistrantAction, string> = {
  'check-in': 'Pendaftar ditandai hadir',
  'undo-check-in': 'Check-in dibatalkan',
  'cancel': 'Pendaftaran dibatalkan',
  'restore': 'Pendaftaran dipulihkan',
}

async function runAction(row: RegistrantRow, action: RegistrantAction) {
  busyId.value = row.id
  try {
    await $fetch(`/api/admin/registrants/${row.id}`, { method: 'POST', body: { action } })
    toast.add({ color: 'success', title: ACTION_TOAST[action], description: `${row.user.fullName} · ${row.event.title}` })
    await Promise.all([refresh(), allCount.refresh(), confirmedCount.refresh(), attendedCount.refresh(), cancelledCount.refresh()])
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ color: 'error', title: 'Gagal memperbarui pendaftar', description: e.data?.statusMessage })
  }
  finally {
    busyId.value = null
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Manajemen Pendaftar"
      title="Daftar Pendaftar Kegiatan"
      description="Pantau jamaah yang mendaftar pada seluruh kegiatan masjid. Catat kehadiran, batalkan, atau pulihkan pendaftaran."
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard label="Total Pendaftar" :num="counts.all.toLocaleString('id-ID')" icon="lucide:users" />
      <AdminStatCard label="Terkonfirmasi" :num="counts.confirmed.toLocaleString('id-ID')" :delta="pct(counts.confirmed)" tone="info" icon="lucide:check" />
      <AdminStatCard label="Hadir" :num="counts.attended.toLocaleString('id-ID')" :delta="pct(counts.attended)" tone="gold" icon="lucide:eye" />
      <AdminStatCard label="Dibatalkan" :num="counts.cancelled.toLocaleString('id-ID')" :delta="pct(counts.cancelled)" tone="rose" icon="lucide:x" />
    </div>

    <div class="flex items-center gap-3 bg-cms-surface border border-cms-border rounded-cms p-2.5 mb-[18px] flex-wrap">
      <div class="flex gap-1.5 flex-wrap">
        <UButton
          v-for="f in filters"
          :key="f.id ?? 'all'"
          size="sm"
          :color="status === f.id ? 'primary' : 'neutral'"
          :variant="status === f.id ? 'soft' : 'ghost'"
          @click="setQuery({ status: f.id, page: undefined })"
        >
          {{ f.label }}
          <UBadge
            :color="status === f.id ? 'primary' : 'neutral'"
            :variant="status === f.id ? 'solid' : 'outline'"
            size="sm"
          >
            {{ f.count }}
          </UBadge>
        </UButton>
      </div>
      <div class="ml-auto flex gap-2 flex-wrap">
        <USelectMenu
          v-model="eventModel"
          :items="eventItems"
          value-key="value"
          :search-input="{ placeholder: 'Cari kegiatan…' }"
          icon="i-lucide-calendar"
          size="sm"
          class="w-[260px]"
        />
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Cari nama, email, kegiatan…"
          size="sm"
          class="w-[240px]"
        />
      </div>
    </div>

    <AdminRegistrantsTable
      :rows="rows"
      :can-edit="isAdmin"
      :busy-id="busyId"
      :class="fetchStatus === 'pending' ? 'opacity-60 transition-opacity' : ''"
      @action="runAction"
    />

    <div
      v-if="pagination"
      class="flex justify-between items-center gap-3 flex-wrap px-1 py-3.5 text-cms-muted text-[13px]"
    >
      <div>
        Menampilkan {{ rows.length }} dari {{ pagination.total.toLocaleString('id-ID') }} pendaftar
      </div>
      <UPagination
        v-if="pagination.totalPages > 1"
        :page="page"
        :total="pagination.total"
        :items-per-page="PAGE_SIZE"
        size="sm"
        @update:page="(p: number) => setQuery({ page: p })"
      />
    </div>
  </div>
</template>
