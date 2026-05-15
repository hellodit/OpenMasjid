<script setup lang="ts">
import type { CategoryId } from '~/composables/useAdminMock'

defineProps<{
  filter: 'all' | CategoryId
  query: string
  view: 'grid' | 'list'
}>()
defineEmits<{
  'update:filter': [v: 'all' | CategoryId]
  'update:query': [v: string]
  'update:view': [v: 'grid' | 'list']
}>()

const { CATEGORIES, EVENTS } = useAdminMock()
const counts = computed(() => {
  const m: Record<string, number> = {}
  for (const c of CATEGORIES) m[c.id] = EVENTS.filter(e => e.cat === c.id).length
  return m
})
</script>

<template>
  <div class="flex items-center gap-3 bg-cms-surface border border-cms-border rounded-cms p-2.5 mb-[18px] flex-wrap">
    <div class="flex gap-1.5">
      <button
        type="button"
        :class="[
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium border transition-colors',
          filter === 'all'
            ? 'bg-cms-green-100 text-cms-green-800 border-cms-green-300'
            : 'border-transparent text-cms-ink-2 hover:bg-cms-green-50',
        ]"
        @click="$emit('update:filter', 'all')"
      >
        Semua
        <span :class="[
          'text-[11px] px-1.5 py-px rounded-lg font-semibold',
          filter === 'all' ? 'bg-cms-green-700 text-white' : 'bg-white text-cms-ink-2',
        ]">
          {{ EVENTS.length }}
        </span>
      </button>
      <button
        v-for="c in CATEGORIES"
        :key="c.id"
        type="button"
        :class="[
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium border transition-colors',
          filter === c.id
            ? 'bg-cms-green-100 text-cms-green-800 border-cms-green-300'
            : 'border-transparent text-cms-ink-2 hover:bg-cms-green-50',
        ]"
        @click="$emit('update:filter', c.id)"
      >
        <Icon :name="c.icon" size="13" />
        {{ c.name }}
        <span :class="[
          'text-[11px] px-1.5 py-px rounded-lg font-semibold',
          filter === c.id ? 'bg-cms-green-700 text-white' : 'bg-white text-cms-ink-2',
        ]">
          {{ counts[c.id] }}
        </span>
      </button>
    </div>

    <div class="ml-auto relative">
      <Icon name="lucide:search" size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-cms-muted" />
      <input
        :value="query"
        placeholder="Cari judul…"
        class="cms-input h-8 border border-cms-border rounded-lg pl-8 pr-3 bg-cms-surface-2 outline-none w-[220px] text-[13px]"
        @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="flex border border-cms-border rounded-lg overflow-hidden">
      <button
        type="button"
        :class="['w-8 h-8 grid place-items-center', view === 'grid' ? 'bg-cms-green-100 text-cms-green-800' : 'bg-cms-surface text-cms-muted']"
        @click="$emit('update:view', 'grid')"
      >
        <Icon name="lucide:layout-grid" size="14" />
      </button>
      <button
        type="button"
        :class="['w-8 h-8 grid place-items-center', view === 'list' ? 'bg-cms-green-100 text-cms-green-800' : 'bg-cms-surface text-cms-muted']"
        @click="$emit('update:view', 'list')"
      >
        <Icon name="lucide:list" size="14" />
      </button>
    </div>
  </div>
</template>
