<script setup lang="ts">
import type { EventStatusFilter } from '~/components/admin/list/Toolbar.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Daftar Kegiatan — OpenMasjid CMS' })

const PAGE_SIZE = 12
const { isAdmin } = useAuth()

const view = ref<'grid' | 'list'>('grid')
const status = ref<EventStatusFilter>('all')
const categoryId = ref('all')
const query = ref('')
const q = ref('')
const page = ref(1)

// Debounce free-text search.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(query, (v) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { q.value = v.trim() }, 300)
})
watch([status, categoryId, q], () => { page.value = 1 })

const { data: categories } = await useFetch('/api/admin/categories', { key: 'admin-event-categories', default: () => [] })

const { data, status: fetchStatus, error } = await useFetch('/api/admin/events', {
  query: computed(() => ({
    q: q.value || undefined,
    categoryId: categoryId.value === 'all' ? undefined : categoryId.value,
    status: status.value === 'all' ? undefined : status.value,
    page: page.value,
    pageSize: PAGE_SIZE,
  })),
})

const events = computed(() => data.value?.data ?? [])
const pagination = computed(() => data.value?.pagination)

const openDetail = (id: string) => navigateTo(`/admin/events/${id}`)
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Manajemen Kegiatan"
      title="Daftar Kegiatan Masjid"
      description="Kelola seluruh kajian, kelas, dan kegiatan sosial yang diselenggarakan oleh DKM."
    >
      <template #actions>
        <UButton v-if="isAdmin" to="/admin/events/new" icon="i-lucide-plus" class="font-semibold">
          Tambah Kegiatan
        </UButton>
      </template>
    </AdminPageHeader>

    <AdminListToolbar
      v-model:status="status"
      v-model:category-id="categoryId"
      v-model:query="query"
      v-model:view="view"
      :categories="categories ?? []"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Gagal memuat kegiatan"
      :description="error.data?.statusMessage ?? error.message"
      class="mb-4"
    />

    <div
      v-else-if="!events.length"
      class="bg-cms-surface border border-dashed border-cms-border rounded-cms-lg py-14 text-center text-cms-muted"
    >
      <Icon name="lucide:calendar-x" size="28" class="mb-2" />
      <div class="font-semibold text-cms-ink-2">Belum ada kegiatan</div>
      <div class="text-[13px]">Tidak ada kegiatan yang cocok dengan filter ini.</div>
    </div>

    <div v-else :class="fetchStatus === 'pending' ? 'opacity-60 transition-opacity' : ''">
      <div v-if="view === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        <NuxtLink
          v-for="ev in events"
          :key="ev.id"
          :to="`/admin/events/${ev.id}`"
        >
          <AdminListEventCard :ev="ev" />
        </NuxtLink>
      </div>
      <AdminListEventTable
        v-else
        :events="events"
        @open="openDetail"
      />
    </div>

    <div
      v-if="pagination && events.length"
      class="flex justify-between items-center gap-3 flex-wrap px-1 py-3.5 text-cms-muted text-[13px]"
    >
      <div>
        Menampilkan {{ events.length }} dari {{ pagination.total.toLocaleString('id-ID') }} kegiatan
      </div>
      <UPagination
        v-if="pagination.totalPages > 1"
        v-model:page="page"
        :total="pagination.total"
        :items-per-page="PAGE_SIZE"
        size="sm"
      />
    </div>
  </div>
</template>
