<script setup lang="ts">
import { dateParts, formatTime, formatTimeRange } from '~/utils/format'
import type { EventDisplayStatus } from '#shared/utils/events'

const props = defineProps<{
  ev: {
    id: string
    title: string
    startDate: string
    startTime: string | null
    endTime: string | null
    locationName: string | null
    capacity: number | null
    registeredCount: number
    displayStatus: EventDisplayStatus
    category: { slug: string, name: string } | null
  }
  /** Show the date instead of the time in the left tile (upcoming list). */
  showDate?: boolean
}>()

const tile = computed(() => {
  if (props.showDate) {
    const p = dateParts(props.ev.startDate)
    return { top: p.d, bottom: p.m }
  }
  const t = formatTime(props.ev.startTime)
  return t ? { top: t, bottom: 'WIB' } : { top: '—', bottom: 'Jam' }
})
</script>

<template>
  <NuxtLink
    :to="`/admin/events/${ev.id}`"
    class="grid grid-cols-[64px_1fr_auto] items-center gap-3.5 px-3.5 py-3 border border-cms-border rounded-cms bg-cms-surface-2 transition-colors hover:bg-cms-green-50 hover:border-cms-green-300"
  >
    <div class="text-center py-2 bg-white border border-cms-border rounded-lg leading-none">
      <div :class="['font-serif font-bold text-cms-green-700', showDate ? 'text-[18px]' : 'text-[15px]']">{{ tile.top }}</div>
      <div class="text-[10px] text-cms-muted uppercase tracking-[0.4px] mt-1">{{ tile.bottom }}</div>
    </div>
    <div class="min-w-0">
      <div class="font-semibold text-sm truncate">{{ ev.title }}</div>
      <div class="text-cms-muted text-[12.5px] mt-0.5 flex items-center gap-2 flex-wrap">
        <span v-if="ev.category" class="inline-flex items-center gap-1">
          <Icon name="lucide:tag" size="12" /> {{ ev.category.name }}
        </span>
        <template v-if="showDate && ev.startTime">
          <span class="text-cms-border-strong">•</span>
          <span class="inline-flex items-center gap-1">
            <Icon name="lucide:clock" size="12" /> {{ formatTimeRange(ev.startTime, ev.endTime) }}
          </span>
        </template>
        <template v-if="ev.locationName">
          <span class="text-cms-border-strong">•</span>
          <span class="inline-flex items-center gap-1">
            <Icon name="lucide:map-pin" size="12" /> {{ ev.locationName }}
          </span>
        </template>
        <span class="text-cms-border-strong">•</span>
        <span class="inline-flex items-center gap-1">
          <Icon name="lucide:users" size="12" /> {{ ev.registeredCount }}{{ ev.capacity ? ` / ${ev.capacity}` : '' }}
        </span>
      </div>
    </div>
    <AdminStatusBadge :status="ev.displayStatus" />
  </NuxtLink>
</template>
