<script setup lang="ts">
import type { EventDisplayStatus } from '#shared/utils/events'
import { bannerClass, dateParts, formatDate, formatTimeRange, initials } from '~/utils/format'

const props = defineProps<{
  ev: {
    title: string
    arabicTitle: string | null
    startDate: string
    endDate: string | null
    startTime: string | null
    endTime: string | null
    bannerUrl: string | null
    isPinned: boolean
    displayStatus: EventDisplayStatus
    category: { slug: string, name: string, icon: string | null } | null
    speakers: { name: string, role: string | null }[]
  }
}>()

const mainSpeaker = computed(() => props.ev.speakers[0])
const dateLabel = computed(() => {
  const start = `${dateParts(props.ev.startDate).day}, ${formatDate(props.ev.startDate)}`
  return props.ev.endDate && props.ev.endDate !== props.ev.startDate
    ? `${start} — ${formatDate(props.ev.endDate)}`
    : start
})
</script>

<template>
  <div :class="['relative rounded-cms-lg text-white px-6 md:px-10 py-9 overflow-hidden min-h-[220px] mb-[18px]', bannerClass(ev.category?.slug)]">
    <template v-if="ev.bannerUrl">
      <img :src="ev.bannerUrl" alt="" class="absolute inset-0 w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
    </template>
    <div v-else class="cms-pattern-strip absolute inset-0 opacity-40" />
    <div class="relative z-[1]">
      <div class="flex items-center gap-2 mb-3.5">
        <div class="inline-flex items-center gap-1.5 bg-white/20 border border-white/25 text-white text-[11.5px] px-2.5 py-1 rounded-full uppercase tracking-[0.6px] font-semibold">
          <Icon :name="ev.category?.icon ?? 'lucide:tag'" size="12" />
          {{ ev.category?.name ?? 'Tanpa kategori' }}
        </div>
        <div v-if="ev.isPinned" class="inline-flex items-center gap-1.5 bg-cms-gold/90 text-cms-green-900 text-[11.5px] px-2.5 py-1 rounded-full uppercase tracking-[0.6px] font-semibold">
          <Icon name="lucide:pin" size="12" /> Disematkan
        </div>
      </div>
      <div v-if="ev.arabicTitle" class="font-arab text-[22px] text-white/65 mb-2 tracking-[1px]" dir="rtl">
        {{ ev.arabicTitle }}
      </div>
      <h1 class="font-serif text-[30px] md:text-[38px] font-semibold m-0 mb-2 tracking-[-0.5px] max-w-[720px] leading-[1.15]">
        {{ ev.title }}
      </h1>
      <div class="opacity-85 max-w-[640px] mt-1">
        {{ dateLabel }}<template v-if="ev.startTime"> • {{ formatTimeRange(ev.startTime, ev.endTime) }}</template>
      </div>
      <div class="flex items-center gap-3 mt-5">
        <template v-if="mainSpeaker">
          <div class="w-11 h-11 rounded-full bg-cms-gold border-2 border-white text-cms-green-900 grid place-items-center font-bold font-serif">
            {{ initials(mainSpeaker.name, 1) }}
          </div>
          <div>
            <div class="font-semibold text-[15px]">{{ mainSpeaker.name }}</div>
            <div v-if="mainSpeaker.role" class="text-[12px] opacity-80">{{ mainSpeaker.role }}</div>
          </div>
        </template>
        <div class="ml-auto">
          <AdminStatusBadge :status="ev.displayStatus" />
        </div>
      </div>
    </div>
  </div>
</template>
