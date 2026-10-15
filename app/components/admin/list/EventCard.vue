<script setup lang="ts">
import type { EventDisplayStatus } from '#shared/utils/events'
import { bannerClass, dateParts, formatTimeRange } from '~/utils/format'

export interface EventListItem {
  id: string
  title: string
  arabicTitle: string | null
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  locationName: string | null
  locationDetail: string | null
  capacity: number | null
  bannerUrl: string | null
  isPinned: boolean
  registeredCount: number
  displayStatus: EventDisplayStatus
  category: { slug: string, name: string, icon: string | null } | null
  speakers: { name: string, role: string | null }[]
}

const props = defineProps<{ ev: EventListItem }>()

const parts = computed(() => dateParts(props.ev.startDate))
const speakerNames = computed(() => props.ev.speakers.map(s => s.name).join(', '))
</script>

<template>
  <article
    class="event-card group h-full bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:border-cms-green-300 hover:shadow-cms"
  >
    <!-- Banner -->
    <div :class="['relative h-[140px] overflow-hidden text-white', bannerClass(ev.category?.slug)]">
      <img
        v-if="ev.bannerUrl"
        :src="ev.bannerUrl"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      >
      <div v-else class="cms-pattern-strip absolute inset-0 opacity-55" />
      <div class="absolute top-3 inset-x-3 flex justify-between items-center z-[2]">
        <span class="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.4px] border border-white/25">
          <Icon v-if="ev.isPinned" name="lucide:pin" size="11" />
          {{ ev.category?.name ?? 'Tanpa kategori' }}
        </span>
        <div class="bg-white text-cms-ink rounded-[10px] px-2.5 py-1.5 text-center leading-none font-bold flex flex-col gap-0.5 shadow-cms-sm">
          <span class="font-serif text-[18px]">{{ parts.d }}</span>
          <span class="text-[10px] text-cms-muted uppercase tracking-[0.5px]">{{ parts.m }}</span>
        </div>
      </div>
      <div v-if="ev.arabicTitle" class="absolute bottom-2 right-3.5 text-[18px] text-white/40 font-arab z-[2]" dir="rtl">
        {{ ev.arabicTitle }}
      </div>
    </div>

    <!-- Body -->
    <div class="p-4 pt-4 pb-3.5 flex-1 flex flex-col">
      <h3 class="font-serif text-[18px] font-semibold m-0 mb-1 leading-[1.25] tracking-[-0.2px]">
        {{ ev.title }}
      </h3>
      <div class="text-cms-muted text-[13px] mb-3 line-clamp-1">{{ speakerNames || '—' }}</div>

      <div class="mt-auto flex flex-col gap-1.5 text-[12.5px] text-cms-ink-2">
        <div class="flex items-center gap-2">
          <Icon name="lucide:clock" size="14" class="text-cms-green-700 shrink-0" />
          <span>{{ parts.day }}<template v-if="ev.startTime"> • {{ formatTimeRange(ev.startTime, ev.endTime) }}</template></span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="lucide:map-pin" size="14" class="text-cms-green-700 shrink-0" />
          <span class="line-clamp-1">{{ ev.locationName || 'Lokasi belum ditentukan' }}</span>
        </div>
      </div>

      <div class="border-t border-dashed border-cms-border mt-3.5 pt-3 flex justify-between items-center gap-2">
        <AdminStatusBadge :status="ev.displayStatus" />
        <AdminCapacityBar v-if="ev.capacity" :attended="ev.registeredCount" :capacity="ev.capacity" />
        <span v-else class="text-[12px] text-cms-muted">{{ ev.registeredCount }} pendaftar</span>
      </div>
    </div>
  </article>
</template>
