<script setup lang="ts">
import { dateInTimeZone } from '#shared/utils/prayer'
import type { AnnouncementVisibility } from '#shared/utils/announcements'
import type { AnnouncementRow } from '~/components/admin/announcements/Card.vue'

const api = useApiBase()
definePageMeta({ layout: 'admin' })
useHead({ title: 'Pengumuman — OpenMasjid CMS' })

const { isAdmin } = useAuth()
const { tenant } = useTenantContext()
const toast = useToast()

const { data, error, refresh, status } = await useFetch(`${api}/admin/announcements`)

const errorMessage = computed(() => (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage ?? error.value?.message)
const today = computed(() => dateInTimeZone(tenant.value?.timezone ?? 'Asia/Jakarta'))

const rows = computed<AnnouncementRow[]>(() => (data.value ?? []) as AnnouncementRow[])

// ─── Filter tabs ─────────────────────────────────────────────────────────
type Filter = 'all' | 'active' | 'scheduled' | 'draft' | 'ended'
const FILTER_MATCH: Record<Filter, (v: AnnouncementVisibility) => boolean> = {
  all: () => true,
  active: v => v === 'active',
  scheduled: v => v === 'scheduled',
  draft: v => v === 'draft',
  ended: v => v === 'expired' || v === 'archived',
}
const filter = ref<Filter>('all')
const count = (f: Filter) => rows.value.filter(r => FILTER_MATCH[f](r.visibility)).length
const tabs = computed(() => [
  { label: 'Semua', value: 'all', badge: rows.value.length },
  { label: 'Tayang', value: 'active', badge: count('active') },
  { label: 'Terjadwal', value: 'scheduled', badge: count('scheduled') },
  { label: 'Draf', value: 'draft', badge: count('draft') },
  { label: 'Berakhir & Arsip', value: 'ended', badge: count('ended') },
])
const visible = computed(() => rows.value.filter(r => FILTER_MATCH[filter.value](r.visibility)))

// ─── Create / edit ───────────────────────────────────────────────────────
const formOpen = ref(false)
const editing = ref<AnnouncementRow | null>(null)
function openCreate() {
  editing.value = null
  formOpen.value = true
}
function openEdit(a: AnnouncementRow) {
  editing.value = a
  formOpen.value = true
}

function errMsg(err: unknown) {
  return (err as { data?: { statusMessage?: string } }).data?.statusMessage
}

// ─── Quick actions (PUT sends the full body) ─────────────────────────────
const busyId = ref<string | null>(null)

function bodyOf(a: AnnouncementRow) {
  return {
    title: a.title,
    body: a.body,
    status: a.status,
    isPinned: a.isPinned,
    showOnDisplay: a.showOnDisplay,
    startsOn: a.startsOn,
    endsOn: a.endsOn,
  }
}

async function quickUpdate(a: AnnouncementRow, patch: Partial<ReturnType<typeof bodyOf>>, success: string, failure: string) {
  busyId.value = a.id
  try {
    await $fetch(`${api}/admin/announcements/${a.id}`, { method: 'PUT', body: { ...bodyOf(a), ...patch } })
    toast.add({ color: 'success', title: success })
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: failure, description: errMsg(err) })
  }
  finally {
    busyId.value = null
  }
}

const togglePin = (a: AnnouncementRow) => quickUpdate(
  a,
  { isPinned: !a.isPinned },
  a.isPinned ? 'Sematan dilepas' : 'Pengumuman disematkan',
  'Gagal mengubah sematan',
)
const archive = (a: AnnouncementRow) => quickUpdate(a, { status: 'archived' }, 'Pengumuman diarsipkan', 'Gagal mengarsipkan')
const publish = (a: AnnouncementRow) => quickUpdate(a, { status: 'published' }, 'Pengumuman diterbitkan', 'Gagal menerbitkan')

// ─── Delete ──────────────────────────────────────────────────────────────
const removing = ref<AnnouncementRow | null>(null)
const removeOpen = computed({
  get: () => !!removing.value,
  set: (v: boolean) => { if (!v) removing.value = null },
})
const removeBusy = ref(false)

async function confirmRemove() {
  const a = removing.value
  if (!a) return
  removeBusy.value = true
  try {
    await $fetch(`${api}/admin/announcements/${a.id}`, { method: 'DELETE' })
    toast.add({ color: 'success', title: 'Pengumuman dihapus' })
    removing.value = null
    await refresh()
  }
  catch (err) {
    toast.add({ color: 'error', title: 'Gagal menghapus pengumuman', description: errMsg(err) })
  }
  finally {
    removeBusy.value = false
  }
}

const EMPTY_TEXT: Record<Filter, string> = {
  all: '',
  active: 'Tidak ada pengumuman yang sedang tayang.',
  scheduled: 'Tidak ada pengumuman terjadwal.',
  draft: 'Tidak ada draf pengumuman.',
  ended: 'Belum ada pengumuman yang berakhir atau diarsipkan.',
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Informasi Jamaah"
      title="Pengumuman"
      description="Sampaikan informasi penting kepada jamaah lewat portal masjid dan layar TV."
    >
      <template #actions>
        <UButton v-if="isAdmin" icon="i-lucide-plus" class="font-semibold" aria-label="Pengumuman Baru" @click="openCreate">
          <span class="max-sm:hidden">Pengumuman</span> Baru
        </UButton>
      </template>
    </AdminPageHeader>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Gagal memuat pengumuman"
      :description="errorMessage"
      class="mb-6"
    />

    <div v-if="rows.length" class="bg-cms-surface border border-cms-border rounded-cms p-2 mb-[18px] overflow-x-auto">
      <UTabs
        v-model="filter"
        :items="tabs"
        :content="false"
        size="sm"
        color="primary"
        class="min-w-max"
      />
    </div>

    <div v-if="status === 'pending' && !rows.length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-[200px] rounded-cms-lg" />
    </div>

    <!-- Empty: no announcements at all -->
    <div
      v-else-if="!rows.length && !error"
      class="bg-cms-surface border border-cms-border rounded-cms-lg px-6 py-14 text-center flex flex-col items-center"
    >
      <div class="w-14 h-14 rounded-xl bg-cms-green-100 border border-cms-green-300 text-cms-green-700 grid place-items-center mb-3">
        <Icon name="lucide:megaphone" size="24" />
      </div>
      <h3 class="font-serif text-[20px] font-semibold m-0">Belum ada pengumuman</h3>
      <p class="text-[13.5px] text-cms-muted mt-1 mb-0 max-w-[420px]">
        Umumkan jadwal kerja bakti, info zakat, atau perubahan jadwal kajian. Pengumuman bisa dijadwalkan dan
        ditampilkan di layar TV masjid.
      </p>
      <UButton v-if="isAdmin" icon="i-lucide-plus" label="Buat Pengumuman Pertama" class="mt-5 font-semibold" @click="openCreate" />
    </div>

    <div
      v-else-if="!visible.length"
      class="text-cms-muted text-sm py-12 text-center bg-cms-surface border border-cms-border rounded-cms-lg"
    >
      {{ EMPTY_TEXT[filter] }}
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <AdminAnnouncementsCard
        v-for="a in visible"
        :key="a.id"
        :announcement="a"
        :can-edit="isAdmin"
        :busy="busyId === a.id"
        @edit="openEdit(a)"
        @pin="togglePin(a)"
        @archive="archive(a)"
        @publish="publish(a)"
        @remove="removing = a"
      />
    </div>

    <AdminAnnouncementsFormSlideover
      v-if="isAdmin"
      v-model:open="formOpen"
      :announcement="editing"
      :today="today"
      @saved="refresh()"
    />

    <UModal v-if="isAdmin" v-model:open="removeOpen" title="Hapus pengumuman?">
      <template #body>
        <p class="text-sm text-cms-ink-2 m-0">
          Pengumuman <b>{{ removing?.title }}</b> akan dihapus dan tidak lagi tampil di portal maupun layar TV.
          Jika hanya ingin menyembunyikannya, gunakan <b>Arsipkan</b>.
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
