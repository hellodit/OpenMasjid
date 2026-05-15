<script setup lang="ts">
import type { Registrant } from '~/composables/useAdminMock'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Pendaftar — Masjidku CMS' })

const { REGISTRANTS } = useAdminMock()

type Filter = 'all' | Registrant['status']
const filter = ref<Filter>('all')
const selected = ref(new Set<number>())

const filters: { id: Filter, label: string }[] = [
  { id: 'all',       label: 'Semua' },
  { id: 'confirmed', label: 'Terkonfirmasi' },
  { id: 'pending',   label: 'Menunggu' },
  { id: 'attended',  label: 'Hadir' },
  { id: 'cancelled', label: 'Dibatalkan' },
]

const counts = computed(() => ({
  all: REGISTRANTS.length,
  confirmed: REGISTRANTS.filter(r => r.status === 'confirmed').length,
  pending:   REGISTRANTS.filter(r => r.status === 'pending').length,
  attended:  REGISTRANTS.filter(r => r.status === 'attended').length,
  cancelled: REGISTRANTS.filter(r => r.status === 'cancelled').length,
} as Record<Filter, number>))

const filtered = computed(() =>
  filter.value === 'all' ? REGISTRANTS : REGISTRANTS.filter(r => r.status === filter.value),
)

const toggle = (i: number) => {
  const s = new Set(selected.value)
  s.has(i) ? s.delete(i) : s.add(i)
  selected.value = s
}
const toggleAll = () => {
  const allOn = filtered.value.length > 0 && filtered.value.every((_, i) => selected.value.has(i))
  selected.value = allOn ? new Set() : new Set(filtered.value.map((_, i) => i))
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Manajemen Pendaftar"
      title="Daftar Pendaftar Kegiatan"
      description="Kelola jamaah yang mendaftar pada seluruh kegiatan masjid. Konfirmasi, batalkan, atau hubungi langsung."
    >
      <template #actions>
        <AdminBtn><Icon name="lucide:download" size="16" /> Ekspor CSV</AdminBtn>
        <AdminBtn variant="primary"><Icon name="lucide:plus" size="16" /> Tambah Manual</AdminBtn>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard label="Total Pendaftar" num="1.284" delta="84 minggu ini" icon="lucide:users" />
      <AdminStatCard label="Terkonfirmasi" num="892" delta="69%" tone="info" icon="lucide:check" />
      <AdminStatCard label="Hadir" num="724" delta="56%" tone="gold" icon="lucide:eye" />
      <AdminStatCard label="Dibatalkan" num="48" delta="3,7%" tone="rose" icon="lucide:x" />
    </div>

    <div class="flex items-center gap-3 bg-cms-surface border border-cms-border rounded-cms p-2.5 mb-[18px] flex-wrap">
      <div class="flex gap-1.5">
        <button
          v-for="f in filters"
          :key="f.id"
          type="button"
          :class="[
            'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium border transition-colors',
            filter === f.id
              ? 'bg-cms-green-100 text-cms-green-800 border-cms-green-300'
              : 'border-transparent text-cms-ink-2 hover:bg-cms-green-50',
          ]"
          @click="filter = f.id"
        >
          {{ f.label }}
          <span :class="[
            'text-[11px] px-1.5 py-px rounded-lg font-semibold',
            filter === f.id ? 'bg-cms-green-700 text-white' : 'bg-white text-cms-ink-2',
          ]">
            {{ counts[f.id] }}
          </span>
        </button>
      </div>
      <div class="ml-auto relative">
        <Icon name="lucide:search" size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-cms-muted" />
        <input
          placeholder="Cari nama atau email…"
          class="cms-input h-8 border border-cms-border rounded-lg pl-8 pr-3 bg-cms-surface-2 outline-none w-[240px] text-[13px]"
        >
      </div>
      <AdminBtn size="sm"><Icon name="lucide:filter" size="14" /> Filter</AdminBtn>
    </div>

    <div
      v-if="selected.size > 0"
      class="flex items-center gap-3 px-4 py-2.5 mb-3 bg-cms-green-100 border border-cms-green-300 rounded-cms text-[13px]"
    >
      <strong>{{ selected.size }}</strong> pendaftar dipilih
      <div class="ml-auto flex gap-2">
        <AdminBtn size="sm"><Icon name="lucide:check" size="14" /> Konfirmasi</AdminBtn>
        <AdminBtn size="sm"><Icon name="lucide:mail" size="14" /> Kirim Email</AdminBtn>
        <AdminBtn size="sm" variant="danger"><Icon name="lucide:x" size="14" /> Batalkan</AdminBtn>
      </div>
    </div>

    <AdminPendaftarTable
      :rows="filtered"
      :selected="selected"
      @toggle="toggle"
      @toggle-all="toggleAll"
    />

    <div class="flex justify-between items-center px-1 py-3.5 text-cms-muted text-[13px]">
      <div>Menampilkan {{ filtered.length }} dari {{ REGISTRANTS.length }} pendaftar</div>
      <div class="flex gap-1.5">
        <AdminBtn size="sm">‹ Sebelumnya</AdminBtn>
        <button class="inline-flex items-center justify-center h-8 px-3 rounded-cms border border-cms-green-700 bg-cms-green-700 text-white text-[13px] font-semibold">1</button>
        <AdminBtn size="sm">2</AdminBtn>
        <AdminBtn size="sm">3</AdminBtn>
        <AdminBtn size="sm">Berikutnya ›</AdminBtn>
      </div>
    </div>
  </div>
</template>
