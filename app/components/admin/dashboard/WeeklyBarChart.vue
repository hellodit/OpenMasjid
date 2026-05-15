<script setup lang="ts">
interface Bar { l: string, v: number, t: number }

const bars: Bar[] = [
  { l: 'Sen', v: 24, t: 18 },
  { l: 'Sel', v: 38, t: 22 },
  { l: 'Rab', v: 42, t: 30 },
  { l: 'Kam', v: 28, t: 25 },
  { l: 'Jum', v: 56, t: 40 },
  { l: 'Sab', v: 48, t: 35 },
  { l: 'Ahd', v: 62, t: 45 },
]
const MAX = 65
</script>

<template>
  <div class="grid grid-cols-7 gap-2.5 items-end h-[160px] py-2">
    <div v-for="b in bars" :key="b.l" class="flex flex-col items-center gap-1.5 h-full">
      <div class="w-full flex gap-1 items-end" style="height: 130px;">
        <div class="cms-bar-grad rounded-t-md relative flex-1" :style="{ height: (b.v / MAX * 100) + '%' }">
          <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-cms-ink-2">{{ b.v }}</span>
        </div>
        <div class="cms-bar-grad-gold rounded-t-md w-1/2" :style="{ height: (b.t / MAX * 100) + '%' }" />
      </div>
      <div class="text-[11px] text-cms-muted font-medium">{{ b.l }}</div>
    </div>
  </div>
</template>
