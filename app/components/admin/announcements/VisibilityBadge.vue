<script setup lang="ts">
import { ANNOUNCEMENT_VISIBILITY_LABELS, type AnnouncementVisibility } from '#shared/utils/announcements'

const props = defineProps<{ visibility: AnnouncementVisibility }>()

const color = computed(() => ({
  active: 'primary',
  scheduled: 'info',
  draft: 'neutral',
  expired: 'warning',
  archived: 'neutral',
} as const)[props.visibility])
</script>

<template>
  <UBadge
    :color="color"
    :variant="visibility === 'archived' ? 'outline' : 'subtle'"
    size="sm"
    class="uppercase tracking-[0.3px] font-semibold rounded-full"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-current" />
    {{ ANNOUNCEMENT_VISIBILITY_LABELS[visibility] }}
  </UBadge>
</template>
