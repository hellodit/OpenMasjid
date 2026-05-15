<script setup lang="ts">
import type { PrayerState } from '~/composables/usePrayerSchedule'

interface Props {
  prayer: PrayerState
}
defineProps<Props>()
</script>

<template>
  <div
    class="relative border transition-all duration-200"
    :class="prayer.isCurrent
      ? 'pr-now-bg border-gold text-bg'
      : prayer.isPassed
        ? 'bg-bg-2/55 border-line opacity-45'
        : 'bg-bg-2/55 border-line'"
    :style="`border-radius: 0.94vw; padding: 1.15vw 1.25vw; ${prayer.isCurrent ? 'box-shadow: 0 18px 48px -18px oklch(0.55 0.12 78 / 0.6);' : ''}`"
  >
    <div
      v-if="prayer.isCurrent"
      class="absolute bg-bg text-gold uppercase font-bold border border-gold rounded-full"
      style="top: -0.52vw; right: 0.94vw; font-size: 0.52vw; letter-spacing: 0.16vw; padding: 0.26vw 0.52vw;"
    >
      Sekarang
    </div>

    <div class="flex items-start justify-between" style="margin-bottom: 0.73vw;">
      <div class="font-serif font-semibold" style="font-size: 1.35vw; letter-spacing: 0.016vw;">{{ prayer.name }}</div>
      <div
        class="font-arab"
        :class="prayer.isCurrent ? 'text-[oklch(0.20_0.05_155)]' : 'text-gold-2'"
        dir="rtl"
        style="font-size: 1.15vw;"
      >
        {{ prayer.ar }}
      </div>
    </div>

    <div class="font-mono font-medium leading-none" style="font-size: 2.29vw; letter-spacing: -0.05vw;">{{ prayer.time }}</div>

    <div
      class="uppercase"
      :class="prayer.isCurrent ? 'text-[oklch(0.20_0.05_155_/_0.7)]' : 'text-muted'"
      style="margin-top: 0.63vw; font-size: 0.63vw; letter-spacing: 0.10vw;"
    >
      Iqomah
      <b
        class="font-mono font-medium tracking-normal normal-case"
        :class="prayer.isCurrent ? 'text-[oklch(0.15_0.03_155)]' : 'text-ink-2'"
        style="font-size: 0.73vw; margin-left: 0.21vw;"
      >{{ prayer.iq }}</b>
    </div>
  </div>
</template>
