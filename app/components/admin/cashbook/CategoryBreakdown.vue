<script setup lang="ts">
import { formatRupiah } from '~/utils/format'

interface BreakdownItem {
  categoryName?: string | null
  colorToken?: string | null
  icon?: string | null
  total: string
  count?: number
  percentage?: string
  type?: 'income' | 'expense'
}

defineProps<{
  title?: string
  items: BreakdownItem[]
  emptyMessage?: string
}>()
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-5">
    <div v-if="title" class="font-semibold text-cms-ink mb-3 text-[14px]">{{ title }}</div>
    <div v-if="!items.length" class="text-cms-muted text-sm py-6 text-center">
      {{ emptyMessage ?? 'Belum ada data.' }}
    </div>
    <ul v-else class="flex flex-col gap-3">
      <li v-for="(item, idx) in items" :key="`${item.categoryName ?? 'unk'}-${idx}`">
        <div class="flex items-center justify-between mb-1.5 gap-2">
          <span class="text-sm font-medium text-cms-ink truncate flex items-center gap-1.5">
            <Icon
              v-if="item.icon"
              :name="item.icon"
              size="14"
              :style="item.colorToken ? `color:${item.colorToken}` : ''"
            />
            {{ item.categoryName ?? '(Tanpa kategori)' }}
          </span>
          <span class="text-sm font-semibold text-cms-ink whitespace-nowrap">
            {{ formatRupiah(item.total) }}
          </span>
        </div>
        <div class="h-2 rounded-full bg-cms-surface-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :style="{
              width: `${item.percentage ?? '0'}%`,
              background: item.colorToken ?? (item.type === 'income' ? 'oklch(0.62 0.13 155)' : 'oklch(0.62 0.18 25)'),
            }"
          />
        </div>
        <div v-if="item.percentage" class="text-[11.5px] text-cms-muted mt-1">
          {{ item.percentage }}%<span v-if="item.count"> · {{ item.count }} transaksi</span>
        </div>
      </li>
    </ul>
  </div>
</template>
