<script setup lang="ts">
const props = defineProps<{ attended: number, capacity: number }>()
const pct = computed(() => Math.round((props.attended / props.capacity) * 100))
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px]">
    <h4 class="font-serif text-[16px] m-0 mb-3 font-semibold flex items-center justify-between">
      Kapasitas
      <span class="text-[11px] text-cms-muted font-medium">{{ pct }}% terisi</span>
    </h4>
    <div class="font-serif text-[28px] font-semibold tracking-[-0.5px]">
      {{ attended }}<span class="text-cms-muted text-[18px] font-normal"> / {{ capacity }}</span>
    </div>
    <div class="h-2 bg-cms-green-100 rounded-lg overflow-hidden mt-2 mb-3">
      <i class="block h-full cms-meter-grad" :style="{ width: Math.min(100, pct) + '%' }" />
    </div>
    <div class="grid grid-cols-2 gap-2 text-[12px] text-cms-muted">
      <div>Sisa kursi <strong class="text-cms-ink">{{ Math.max(0, capacity - attended) }}</strong></div>
      <div>Daftar tunggu <strong class="text-cms-ink">0</strong></div>
    </div>
  </div>
</template>
