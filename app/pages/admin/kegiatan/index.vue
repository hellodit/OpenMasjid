<script setup lang="ts">
import type { CategoryId } from '~/composables/useAdminMock'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Daftar Kegiatan — Masjidku CMS' })

const { EVENTS } = useAdminMock()
const router = useRouter()

const view = ref<'grid' | 'list'>('grid')
const filter = ref<'all' | CategoryId>('all')
const query = ref('')

const filtered = computed(() => EVENTS.filter((e) => {
  if (filter.value !== 'all' && e.cat !== filter.value) return false
  if (query.value && !e.title.toLowerCase().includes(query.value.toLowerCase())) return false
  return true
}))

const openDetail = (id: string) => router.push(`/admin/kegiatan/${id}`)
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Manajemen Kegiatan"
      title="Daftar Kegiatan Masjid"
      description="Kelola seluruh kajian, kelas, dan kegiatan sosial yang diselenggarakan oleh DKM Masjid Al-Hikmah."
    >
      <template #actions>
        <AdminBtn variant="default">
          <Icon name="lucide:download" size="16" /> Ekspor
        </AdminBtn>
        <AdminBtn variant="primary" to="/admin/kegiatan/tambah">
          <Icon name="lucide:plus" size="16" /> Tambah Kegiatan
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard label="Total Kegiatan" :num="48" delta="12% bulan ini" icon="lucide:calendar" />
      <AdminStatCard label="Sedang Berjalan" :num="6" delta="2 hari ini" tone="info" icon="lucide:clock" />
      <AdminStatCard label="Total Pendaftar" num="1.284" delta="84 minggu ini" tone="gold" icon="lucide:users" />
      <AdminStatCard label="Donasi Terkumpul" num="Rp 18,4 jt" delta="Rp 2,1 jt" tone="rose" icon="lucide:heart" />
    </div>

    <AdminListToolbar
      v-model:filter="filter"
      v-model:query="query"
      v-model:view="view"
    />

    <div v-if="view === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
      <NuxtLink
        v-for="ev in filtered"
        :key="ev.id"
        :to="`/admin/kegiatan/${ev.id}`"
      >
        <AdminListEventCard :ev="ev" />
      </NuxtLink>
    </div>
    <AdminListEventTable
      v-else
      :events="filtered"
      @open="openDetail"
    />
  </div>
</template>
