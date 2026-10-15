<script setup lang="ts">
const props = defineProps<{ registered: number, attended: number, capacity: number | null }>()
const pct = computed(() => props.capacity ? Math.round((props.registered / props.capacity) * 100) : 0)
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px]">
    <h4 class="font-serif text-[16px] m-0 mb-3 font-semibold flex items-center justify-between">
      Kapasitas
      <span v-if="capacity" class="text-[11px] text-cms-muted font-medium">{{ pct }}% terisi</span>
      <span v-else class="text-[11px] text-cms-muted font-medium">Tanpa batas</span>
    </h4>
    <div class="font-serif text-[28px] font-semibold tracking-[-0.5px]">
      {{ registered }}<span v-if="capacity" class="text-cms-muted text-[18px] font-normal"> / {{ capacity }}</span>
      <span class="text-cms-muted text-[13px] font-sans font-normal"> pendaftar</span>
    </div>
    <div v-if="capacity" class="h-2 bg-cms-green-100 rounded-lg overflow-hidden mt-2 mb-3">
      <i class="block h-full cms-meter-grad" :style="{ width: Math.min(100, pct) + '%' }" />
    </div>
    <div class="grid grid-cols-2 gap-2 text-[12px] text-cms-muted mt-3">
      <div>Hadir <strong class="text-cms-ink">{{ attended }}</strong></div>
      <div v-if="capacity">Sisa kursi <strong class="text-cms-ink">{{ Math.max(0, capacity - registered) }}</strong></div>
    </div>
  </div>
</template>
