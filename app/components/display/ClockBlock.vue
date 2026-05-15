<script setup lang="ts">
interface Props {
  hhmm: string
  seconds: string
  gregorianDate: string
  hijriDate: string
}
defineProps<Props>()
</script>

<template>
  <div>
    <div class="flex items-center text-gold-2 uppercase mb-[0.75vw]" style="gap: 0.75vw; font-size: 0.7vw; letter-spacing: 0.27vw;">
      Waktu Sekarang
      <span
        class="flex-1 h-px"
        style="max-width: 11.5vw; background: linear-gradient(90deg, oklch(0.85 0.07 78), transparent);"
      />
    </div>

    <div class="font-serif font-medium text-ink leading-[0.95]" style="font-size: 7.9vw; letter-spacing: -0.26vw;">
      <span>{{ hhmm }}</span>
      <span class="text-gold tracking-normal align-[0.5em]" style="font-size: 3.75vw; margin-left: 0.52vw;">{{ seconds }}</span>
    </div>

    <div class="flex items-center text-ink-2" style="margin-top: 0.94vw; gap: 1.35vw;">
      <div class="font-medium" style="font-size: 1.15vw;">{{ gregorianDate }}</div>
      <div class="w-px bg-line" style="height: 1.35vw;" />
      <div class="text-gold-2 font-serif italic" style="font-size: 1.15vw;">{{ hijriDate }}</div>
    </div>
  </div>
</template>
