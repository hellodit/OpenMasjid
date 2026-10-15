<script setup lang="ts">
import type { PrayerState } from '~/composables/usePrayerSchedule'
import PrayerSchedule from './PrayerSchedule.vue'
import QRSlide from './QRSlide.vue'
import CashbookSlide from './CashbookSlide.vue'
import DutySlide, { type DutySlideColumn } from './DutySlide.vue'

interface CashbookSummary {
  totalBalance: string
  totalIncome: string
  totalExpense: string
  range: { from: string, to: string }
}

interface DutyRoster {
  title: string
  dateLabel: string
  columns: DutySlideColumn[]
  topic?: string | null
}

interface Props {
  prayers: PrayerState[]
  cashbook?: CashbookSummary | null
  duty?: DutyRoster | null
  interval?: number
}
const props = withDefaults(defineProps<Props>(), { interval: 12000, cashbook: null, duty: null })

type Slide = 'prayer' | 'duty' | 'cashbook' | 'qr'
const slides = computed<Slide[]>(() => {
  const list: Slide[] = []
  if (props.prayers.length) list.push('prayer')
  if (props.duty?.columns.length) list.push('duty')
  if (props.cashbook) list.push('cashbook')
  list.push('qr')
  return list
})
const activeIndex = ref(0)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % slides.value.length
  }, props.interval)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
watch(() => slides.value.length, (len) => {
  if (activeIndex.value >= len) activeIndex.value = 0
})
</script>

<template>
  <div class="relative z-10 flex-1 flex flex-col justify-center">
    <div class="slides-stack">
      <div
        v-for="(name, i) in slides"
        :key="name"
        class="slide"
        :class="{ 'is-active': activeIndex === i }"
        :aria-hidden="activeIndex !== i"
      >
        <PrayerSchedule v-if="name === 'prayer'" :prayers="prayers" />
        <DutySlide
          v-else-if="name === 'duty' && duty"
          :title="duty.title"
          :date-label="duty.dateLabel"
          :columns="duty.columns"
          :topic="duty.topic"
        />
        <CashbookSlide
          v-else-if="name === 'cashbook' && cashbook"
          :total-balance="cashbook.totalBalance"
          :total-income="cashbook.totalIncome"
          :total-expense="cashbook.totalExpense"
          :range="cashbook.range"
        />
        <QRSlide v-else />
      </div>
    </div>

    <div
      class="flex justify-center items-center"
      style="gap: 0.52vw; margin-top: 1.04vw;"
    >
      <span
        v-for="(_, i) in slides"
        :key="i"
        class="rounded-full transition-all duration-300"
        :class="activeIndex === i ? 'bg-tv-gold' : 'bg-tv-line'"
        :style="activeIndex === i
          ? 'width: 1.46vw; height: 0.42vw;'
          : 'width: 0.42vw; height: 0.42vw;'"
      />
    </div>
  </div>
</template>

<style scoped>
.slides-stack {
  display: grid;
  grid-template-areas: 'stack';
}
.slide {
  grid-area: stack;
  opacity: 0;
  pointer-events: none;
  transition: opacity 600ms ease;
}
.slide.is-active {
  opacity: 1;
  pointer-events: auto;
}
</style>
