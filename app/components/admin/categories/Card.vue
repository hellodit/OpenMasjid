<script setup lang="ts">
import { bannerClass } from '~/utils/format'

const props = defineProps<{
  category: {
    id: string
    slug: string
    name: string
    description: string | null
    icon: string | null
    colorToken: string | null
    sortOrder: number
    isActive: boolean
    eventCount: number
  }
  canEdit: boolean
  busy?: boolean
}>()

const emit = defineEmits<{
  edit: []
  remove: []
  toggle: [value: boolean]
}>()

const menu = computed(() => [[
  { label: 'Ubah', icon: 'i-lucide-pencil', onSelect: () => emit('edit') },
  { label: 'Lihat kegiatan', icon: 'i-lucide-calendar', to: `/admin/events?categoryId=${props.category.id}` },
], [
  {
    label: props.category.eventCount ? 'Arsipkan' : 'Hapus',
    icon: props.category.eventCount ? 'i-lucide-archive' : 'i-lucide-trash-2',
    color: 'error' as const,
    onSelect: () => emit('remove'),
  },
]])
</script>

<template>
  <div
    :class="[
      'relative rounded-cms-lg p-6 text-white overflow-hidden min-h-[200px] flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-cms',
      bannerClass(category.colorToken ?? category.slug),
      category.isActive ? '' : 'opacity-60 grayscale-[40%]',
    ]"
  >
    <div class="cms-pattern-strip absolute inset-0 opacity-50 pointer-events-none" />
    <div class="relative z-[1] flex flex-col h-full">
      <div class="flex items-start justify-between gap-2">
        <div class="w-12 h-12 rounded-xl bg-white/20 border border-white/25 grid place-items-center">
          <Icon :name="category.icon || 'lucide:tag'" size="24" />
        </div>
        <div class="flex items-center gap-2">
          <USwitch
            v-if="canEdit"
            :model-value="category.isActive"
            :disabled="busy"
            color="neutral"
            size="sm"
            :aria-label="category.isActive ? 'Nonaktifkan kategori' : 'Aktifkan kategori'"
            @update:model-value="(v: boolean) => emit('toggle', v)"
          />
          <UDropdownMenu v-if="canEdit" :items="menu" :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-settings"
              size="sm"
              color="neutral"
              variant="ghost"
              class="text-white bg-white/10 border border-white/20 hover:bg-white/20"
              aria-label="Pengaturan kategori"
            />
          </UDropdownMenu>
        </div>
      </div>
      <h3 class="font-serif text-[22px] mb-1 font-semibold mt-[18px]">{{ category.name }}</h3>
      <div class="font-mono text-[12px] opacity-65 mb-3.5">/{{ category.slug }}</div>
      <div class="text-[13px] opacity-85 leading-relaxed flex-1">
        {{ category.description || 'Belum ada deskripsi.' }}
      </div>

      <div class="grid grid-cols-3 gap-2.5 pt-3.5 border-t border-white/15 mt-[18px]">
        <div>
          <div class="text-[10px] opacity-70 uppercase tracking-[0.5px] font-semibold">Kegiatan</div>
          <div class="font-serif text-[20px] font-bold leading-none mt-1">{{ category.eventCount }}</div>
        </div>
        <div>
          <div class="text-[10px] opacity-70 uppercase tracking-[0.5px] font-semibold">Urutan</div>
          <div class="font-serif text-[20px] font-bold leading-none mt-1">{{ category.sortOrder }}</div>
        </div>
        <div>
          <div class="text-[10px] opacity-70 uppercase tracking-[0.5px] font-semibold">Status</div>
          <div class="text-[13px] font-bold leading-none mt-1.5">{{ category.isActive ? 'Aktif' : 'Nonaktif' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
