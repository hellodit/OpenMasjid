<script setup lang="ts">
import { formatTime, formatTimeRange } from '~/utils/format'
defineProps<{
  items: { id?: string, startTime: string | null, endTime: string | null, title: string, person: string | null }[]
}>()

const timeLabel = (s: { startTime: string | null, endTime: string | null }) =>
  s.startTime ? formatTimeRange(s.startTime, s.endTime) : s.endTime ? `s.d. ${formatTime(s.endTime)}` : '—'
</script>

<template>
  <ul class="list-none p-0 m-0">
    <li
      v-for="(s, i) in items"
      :key="s.id ?? i"
      :class="['flex gap-3.5 py-3', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div class="font-mono text-[12.5px] text-cms-green-700 font-semibold shrink-0 w-[110px] pt-0.5">
        {{ timeLabel(s) }}
      </div>
      <div>
        <div class="font-semibold text-sm">{{ s.title }}</div>
        <div v-if="s.person" class="text-cms-muted text-[12.5px] mt-0.5">{{ s.person }}</div>
      </div>
    </li>
  </ul>
</template>
