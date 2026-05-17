<script setup lang="ts">
import type { PrayerState } from '~/composables/usePrayerSchedule'
import PrayerSchedule from './PrayerSchedule.vue'
import QRSlide from './QRSlide.vue'

interface Props {
  prayers: PrayerState[]
  interval?: number
}
const props = withDefaults(defineProps<Props>(), { interval: 12000 })

const slides = ['prayer', 'qr'] as const
const activeIndex = ref(0)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % slides.length
  }, props.interval)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
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
        :class="activeIndex === i ? 'bg-gold' : 'bg-line'"
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
