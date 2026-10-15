<script setup lang="ts">
export type EventStatusFilter = 'all' | 'upcoming' | 'ongoing' | 'full' | 'draft' | 'past' | 'archived'

defineProps<{
  categories: { id: string, name: string, icon: string | null }[]
}>()

const status = defineModel<EventStatusFilter>('status', { required: true })
const categoryId = defineModel<string>('categoryId', { required: true })
const query = defineModel<string>('query', { required: true })
const view = defineModel<'grid' | 'list'>('view', { required: true })

const statusTabs: { label: string, value: EventStatusFilter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Akan Datang', value: 'upcoming' },
  { label: 'Berjalan', value: 'ongoing' },
  { label: 'Penuh', value: 'full' },
  { label: 'Draf', value: 'draft' },
  { label: 'Selesai', value: 'past' },
  { label: 'Arsip', value: 'archived' },
]
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms p-2.5 mb-[18px] flex flex-col gap-2.5">
    <UTabs
      v-model="status"
      :items="statusTabs"
      :content="false"
      size="sm"
      color="primary"
      class="w-full overflow-x-auto"
    />

    <div class="flex items-center gap-2.5 flex-wrap">
      <USelect
        v-model="categoryId"
        :items="[{ label: 'Semua kategori', value: 'all' }, ...categories.map(c => ({ label: c.name, value: c.id, icon: c.icon ?? undefined }))]"
        size="sm"
        class="w-[200px]"
        icon="i-lucide-tag"
      />

      <UInput
        v-model="query"
        placeholder="Cari judul atau lokasi…"
        icon="i-lucide-search"
        size="sm"
        class="ml-auto w-[240px]"
      />

      <div class="flex border border-cms-border rounded-lg overflow-hidden">
        <UButton
          :color="view === 'grid' ? 'primary' : 'neutral'"
          :variant="view === 'grid' ? 'soft' : 'ghost'"
          icon="i-lucide-layout-grid"
          size="sm"
          square
          class="rounded-none"
          aria-label="Tampilan kartu"
          @click="view = 'grid'"
        />
        <UButton
          :color="view === 'list' ? 'primary' : 'neutral'"
          :variant="view === 'list' ? 'soft' : 'ghost'"
          icon="i-lucide-list"
          size="sm"
          square
          class="rounded-none"
          aria-label="Tampilan tabel"
          @click="view = 'list'"
        />
      </div>
    </div>
  </div>
</template>
