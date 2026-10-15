<script setup lang="ts">
import { EVENT_STATUS_LABELS, type EventDisplayStatus } from '#shared/utils/events'

const props = defineProps<{ status: EventDisplayStatus }>()

const color = computed(() => ({
  published: 'primary',
  draft: 'neutral',
  ongoing: 'info',
  full: 'error',
  archived: 'neutral',
} as const)[props.status])
</script>

<template>
  <UBadge
    :color="color"
    :variant="status === 'archived' ? 'outline' : 'subtle'"
    size="sm"
    class="uppercase tracking-[0.3px] font-semibold rounded-full"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-current" />
    {{ EVENT_STATUS_LABELS[status] }}
  </UBadge>
</template>
