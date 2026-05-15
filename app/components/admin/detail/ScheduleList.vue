<script setup lang="ts">
import type { ScheduleItem } from '~/composables/useAdminMock'

defineProps<{ items: ScheduleItem[] }>()
</script>

<template>
  <ul class="list-none p-0 m-0">
    <li
      v-for="(s, i) in items"
      :key="i"
      :class="['flex gap-3.5 py-3', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div class="font-mono text-[12.5px] text-cms-green-700 font-semibold shrink-0 w-[110px] pt-0.5">
        {{ s.time }}
      </div>
      <div>
        <div class="font-semibold text-sm">{{ s.what }}</div>
        <div class="text-cms-muted text-[12.5px] mt-0.5">{{ s.who }}</div>
      </div>
    </li>
  </ul>
</template>
