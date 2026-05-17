<script setup lang="ts">
import type { PrayerState } from '~/composables/usePrayerSchedule'
import PrayerCard from './PrayerCard.vue'

interface Props {
  prayers: PrayerState[]
}
defineProps<Props>()
</script>

<template>
  <div class="relative z-10">
    <div
      class="flex items-center text-gold-2 uppercase"
      style="gap: 1.04vw; margin-bottom: 1.15vw; font-size: 0.68vw; letter-spacing: 0.26vw;"
    >
      Jadwal Sholat Lima Waktu
      <span
        class="flex-1 h-px"
        style="background: linear-gradient(90deg, oklch(0.32 0.05 155), transparent);"
      />
    </div>

    <div class="grid grid-cols-5" style="gap: 0.94vw;">
      <PrayerCard
        v-for="p in prayers"
        :key="p.id"
        :prayer="p"
      />
    </div>
  </div>
</template>
