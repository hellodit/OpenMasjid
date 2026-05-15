<script setup lang="ts">
import type { AdminEvent } from '~/composables/useAdminMock'

const props = defineProps<{ ev: AdminEvent }>()

const hour = computed(() => {
  const after = props.ev.time.split('—')[1]?.trim() ?? ''
  return after.split(':')[0] || '19'
})
const meridiem = computed(() => {
  const parts = props.ev.time.split(' ')
  return parts[0] === "Ba'da" ? parts[1] : 'WIB'
})
</script>

<template>
  <div class="grid grid-cols-[64px_1fr_auto] items-center gap-3.5 px-3.5 py-3 border border-cms-border rounded-cms bg-cms-surface-2 cursor-pointer transition-colors hover:bg-cms-green-50 hover:border-cms-green-300">
    <div class="text-center py-2 bg-white border border-cms-border rounded-lg leading-none">
      <div class="font-serif text-[18px] font-bold text-cms-green-700">{{ hour }}</div>
      <div class="text-[10px] text-cms-muted uppercase tracking-[0.4px] mt-1">{{ meridiem }}</div>
    </div>
    <div>
      <div class="font-semibold text-sm">{{ ev.title }}</div>
      <div class="text-cms-muted text-[12.5px] mt-0.5 flex items-center gap-2 flex-wrap">
        <span class="inline-flex items-center gap-1">
          <Icon name="lucide:mic" size="12" /> {{ ev.speaker }}
        </span>
        <span class="text-cms-border-strong">•</span>
        <span class="inline-flex items-center gap-1">
          <Icon name="lucide:map-pin" size="12" /> {{ ev.location }}
        </span>
      </div>
    </div>
    <AdminStatusBadge :status="ev.status" />
  </div>
</template>
