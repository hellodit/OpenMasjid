<script setup lang="ts">
import { dateInTimeZone } from '#shared/utils/prayer'
import { DUTY_ROLE_LABELS, DUTY_SERVICE_LABELS, addDays, daysBetween, type DutyRole, type DutyService } from '#shared/utils/duties'
import type { DutyRow } from '~/components/admin/duties/DaySection.vue'
import type { DutyPreset } from '~/components/admin/duties/FormModal.vue'

const api = useApiBase()
definePageMeta({ layout: 'admin' })
useHead({ title: 'Jadwal Petugas — OpenMasjid CMS' })

const { isAdmin } = useAuth()
const { tenant } = useTenantContext()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const ISO = /^\d{4}-\d{2}-\d{2}$/

/** Monday of the (Monday-based) week containing `date`. */
function mondayOf(date: string): string {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay()
  return addDays(date, -((dow + 6) % 7))
}

const today = computed(() => dateInTimeZone(tenant.value?.timezone ?? 'Asia/Jakarta'))
const thisMonday = computed(() => mondayOf(today.value))
const weekStart = computed(() => {
  const q = route.query.week
  const v = Array.isArray(q) ? q[0] : q
  return typeof v === 'string' && ISO.test(v) && !Number.isNaN(Date.parse(v)) ? mondayOf(v) : thisMonday.value
})
const weekEnd = computed(() => addDays(weekStart.value, 6))
const days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart.value, i)))
const friday = computed(() => addDays(weekStart.value, 4))
const isThisWeek = computed(() => weekStart.value === thisMonday.value)

function goToWeek(monday: string) {
  router.replace({ query: { ...route.query, week: monday === thisMonday.value ? undefined : monday } })
}
const prevWeek = () => goToWeek(addDays(weekStart.value, -7))
const nextWeek = () => goToWeek(addDays(weekStart.value, 7))

const jumpDate = ref('')
watch(jumpDate, (v) => {
  if (v && ISO.test(v)) goToWeek(mondayOf(v))
})
watch(weekStart, () => { jumpDate.value = '' })

const { data, error, refresh, status } = await useFetch(`${api}/admin/duties`, {
  query: computed(() => ({ from: weekStart.value, to: weekEnd.value })),
})
const errorMessage = computed(() => (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage ?? error.value?.message)

const items = computed<DutyRow[]>(() => (data.value?.items ?? []) as DutyRow[])
const itemsByDate = computed(() => {
  const map = new Map<string, DutyRow[]>()
  for (const d of items.value) {
    const list = map.get(d.date) ?? []
    list.push(d)
    map.set(d.date, list)
  }
  return map
})
const fridayItems = computed(() => (itemsByDate.value.get(friday.value) ?? []).filter(d => d.service === 'jumuah'))

const SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const SHORT_Y = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const rangeLabel = computed(() => {
  const s = new Date(`${weekStart.value}T00:00:00Z`)
  const e = new Date(`${weekEnd.value}T00:00:00Z`)
  if (weekStart.value.slice(0, 7) === weekEnd.value.slice(0, 7)) return `${s.getUTCDate()} – ${SHORT_Y.format(e)}`
  if (weekStart.value.slice(0, 4) === weekEnd.value.slice(0, 4)) return `${SHORT.format(s)} – ${SHORT_Y.format(e)}`
  return `${SHORT_Y.format(s)} – ${SHORT_Y.format(e)}`
})

const fridayTitle = computed(() => {
  const diff = daysBetween(thisMonday.value, weekStart.value) / 7
  if (diff === 0) return "Jum'at ini"
  if (diff === 1) return "Jum'at depan"
  if (diff === -1) return "Jum'at lalu"
  return "Jum'at pekan ini"
})

const weekCaption = computed(() => {
  const diff = daysBetween(thisMonday.value, weekStart.value) / 7
  if (diff === 0) return 'Minggu ini'
  if (diff === 1) return 'Minggu depan'
  if (diff === -1) return 'Minggu lalu'
  return diff > 0 ? `${diff} minggu lagi` : `${-diff} minggu lalu`
})

// ─── Create / edit ───────────────────────────────────────────────────────
const formOpen = ref(false)
const editing = ref<DutyRow | null>(null)
const preset = ref<DutyPreset | null>(null)

function openCreate(p?: { date: string, service?: DutyService, role?: DutyRole }) {
  editing.value = null
  preset.value = p ?? { date: today.value >= weekStart.value && today.value <= weekEnd.value ? today.value : weekStart.value }
  formOpen.value = true
}
function openEdit(d: DutyRow) {
  editing.value = d
  preset.value = null
  formOpen.value = true
}

function errMsg(err: unknown) {
  return (err as { data?: { statusMessage?: string } }).data?.statusMessage
}

// ─── Delete ──────────────────────────────────────────────────────────────
const removing = ref<DutyRow | null>(null)
const removeOpen = computed({
  get: () => !!removing.value,
  set: (v: boolean) => { if (!v) removing.value = null },
})
const removeBusy = ref(false)

async function confirmRemove() {
  const d = removing.value
  if (!d) return
  removeBusy.value = true
  try {
    await $fetch(`${api}/admin/duties/${d.id}`, { method: 'DELETE' })
    toast.add({ color: 'success', title: 'Petugas dihapus' })
    removing.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal menghapus petugas', description: errMsg(err) })
  }
  finally {
    removeBusy.value = false
  }
}

// ─── Copy last week ──────────────────────────────────────────────────────
const copying = ref(false)
async function copyLastWeek() {
  copying.value = true
  try {
    const sourceFrom = addDays(weekStart.value, -7)
    const res = await $fetch(`${api}/admin/duties/copy`, {
      method: 'POST',
      body: { sourceFrom, sourceTo: addDays(sourceFrom, 6), targetFrom: weekStart.value },
    })
    if (!res.copied && !res.skipped) {
      toast.add({ color: 'warning', title: 'Minggu lalu belum ada petugas', description: 'Tidak ada yang bisa disalin.' })
    }
    else {
      toast.add({
        color: 'success',
        title: 'Jadwal minggu lalu disalin',
        description: `${res.copied} disalin, ${res.skipped} dilewati${res.skipped ? ' (sudah terisi)' : ''}.`,
      })
    }
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal menyalin jadwal', description: errMsg(err) })
  }
  finally {
    copying.value = false
  }
}

function printWeek() {
  window.print()
}

const actionMenu = computed(() => [[
  { label: 'Salin dari minggu lalu', icon: 'i-lucide-copy', onSelect: () => copyLastWeek() },
  { label: 'Cetak jadwal', icon: 'i-lucide-printer', onSelect: () => printWeek() },
]])
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Ibadah"
      title="Jadwal Petugas"
      description="Atur imam, khatib, muadzin, dan bilal untuk sholat Jum'at dan sholat harian."
    >
      <template #actions>
        <UButton
          v-if="isAdmin"
          icon="i-lucide-copy"
          color="neutral"
          variant="outline"
          label="Salin dari minggu lalu"
          :loading="copying"
          class="max-lg:hidden"
          @click="copyLastWeek"
        />
        <UButton
          icon="i-lucide-printer"
          color="neutral"
          variant="outline"
          label="Cetak"
          class="max-lg:hidden"
          @click="printWeek"
        />
        <UDropdownMenu v-if="isAdmin" :items="actionMenu" :content="{ align: 'end' }" class="lg:hidden">
          <UButton icon="i-lucide-ellipsis" color="neutral" variant="outline" square aria-label="Aksi lainnya" :loading="copying" />
        </UDropdownMenu>
        <UButton
          v-else
          icon="i-lucide-printer"
          color="neutral"
          variant="outline"
          square
          aria-label="Cetak"
          class="lg:hidden"
          @click="printWeek"
        />
        <UButton v-if="isAdmin" icon="i-lucide-plus" label="Tambah" class="font-semibold" @click="openCreate()" />
      </template>
    </AdminPageHeader>

    <!-- Week navigation -->
    <div class="bg-cms-surface border border-cms-border rounded-cms p-2.5 mb-5 flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-1">
        <UButton icon="i-lucide-chevron-left" color="neutral" variant="ghost" square aria-label="Minggu sebelumnya" @click="prevWeek" />
        <UButton icon="i-lucide-chevron-right" color="neutral" variant="ghost" square aria-label="Minggu berikutnya" @click="nextWeek" />
      </div>
      <div class="min-w-0">
        <div class="font-serif text-[18px] font-semibold leading-tight" data-testid="week-range">{{ rangeLabel }}</div>
        <div class="text-[12px] text-cms-muted">{{ weekCaption }} · Senin – Minggu</div>
      </div>
      <div class="flex items-center gap-2 ml-auto">
        <UButton
          v-if="!isThisWeek"
          color="neutral"
          variant="outline"
          size="sm"
          label="Minggu ini"
          icon="i-lucide-calendar-check"
          @click="goToWeek(thisMonday)"
        />
        <UInput v-model="jumpDate" type="date" size="sm" aria-label="Lompat ke tanggal" class="w-[150px]" />
      </div>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Gagal memuat jadwal petugas"
      :description="errorMessage"
      class="mb-5"
    />

    <AdminDutiesFridayCard
      :date="friday"
      :title="fridayTitle"
      :items="fridayItems"
      :can-edit="isAdmin"
      @add="openCreate"
      @edit="openEdit"
    />

    <div v-if="status === 'pending' && !items.length" class="grid gap-3">
      <USkeleton v-for="i in 4" :key="i" class="h-[96px] rounded-cms-lg" />
    </div>

    <div
      v-else-if="!items.length && !error"
      class="bg-cms-surface border border-cms-border rounded-cms-lg px-6 py-12 text-center flex flex-col items-center"
      data-testid="duty-empty"
    >
      <div class="w-14 h-14 rounded-xl bg-cms-green-100 border border-cms-green-300 text-cms-green-700 grid place-items-center mb-3">
        <Icon name="lucide:user-round-check" size="24" />
      </div>
      <h3 class="font-serif text-[20px] font-semibold m-0">Belum ada petugas minggu ini</h3>
      <p class="text-[13.5px] text-cms-muted mt-1 mb-0 max-w-[440px]">
        Tambahkan imam, khatib, muadzin, atau bilal. Jadwal yang sama tiap minggu bisa disalin dari minggu lalu.
      </p>
      <div v-if="isAdmin" class="flex flex-wrap justify-center gap-2 mt-5">
        <UButton icon="i-lucide-plus" label="Tambah Petugas" class="font-semibold" @click="openCreate()" />
        <UButton icon="i-lucide-copy" color="neutral" variant="outline" label="Salin dari minggu lalu" :loading="copying" @click="copyLastWeek" />
      </div>
    </div>

    <div v-else class="grid gap-3">
      <AdminDutiesDaySection
        v-for="d in days"
        :key="d"
        :date="d"
        :items="itemsByDate.get(d) ?? []"
        :is-today="d === today"
        :can-edit="isAdmin"
        @add="openCreate"
        @edit="openEdit"
        @remove="removing = $event"
      />
    </div>

    <AdminDutiesPrintSheet
      :mosque-name="tenant?.name ?? ''"
      :range-label="rangeLabel"
      :days="days"
      :items-by-date="itemsByDate"
    />

    <AdminDutiesFormModal
      v-if="isAdmin"
      v-model:open="formOpen"
      :duty="editing"
      :preset="preset"
      @saved="refresh()"
    />

    <UModal v-if="isAdmin" v-model:open="removeOpen" title="Hapus petugas?">
      <template #body>
        <p class="text-sm text-cms-ink-2 m-0">
          <b>{{ removing?.personName }}</b> akan dihapus dari jadwal
          {{ removing ? `${DUTY_ROLE_LABELS[removing.role]} ${DUTY_SERVICE_LABELS[removing.service]}, ${formatDate(removing.date)}` : '' }}.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="outline" label="Batal" @click="removing = null" />
          <UButton color="error" :loading="removeBusy" icon="i-lucide-trash-2" label="Hapus" @click="confirmRemove" />
        </div>
      </template>
    </UModal>
  </div>
</template>
