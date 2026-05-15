<script setup lang="ts">
import { statusLabel, type EventStatus } from '~/composables/useAdminMock'

const props = defineProps<{ status: EventStatus }>()

const toneMap: Record<EventStatus, string> = {
  published: 'bg-cms-green-100 text-cms-green-800',
  draft:     'bg-[oklch(0.94_0.005_100)] text-cms-muted',
  ongoing:   'bg-cms-info-soft text-cms-info',
  full:      'bg-cms-rose-soft text-cms-rose',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full tracking-[0.3px] uppercase',
      toneMap[props.status],
    ]"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-current" />
    {{ statusLabel[props.status] }}
  </span>
</template>
