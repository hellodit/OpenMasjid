<script setup lang="ts">
const legend = [
  { name: 'Kajian Rutin',     color: 'oklch(0.45 0.10 155)', value: 18 },
  { name: 'Tahsin & Tahfidz', color: 'oklch(0.50 0.09 200)', value: 11 },
  { name: 'TPA / TPQ',        color: 'oklch(0.60 0.10 78)',  value: 9 },
  { name: 'Zakat & Sosial',   color: 'oklch(0.50 0.10 30)',  value: 6 },
  { name: 'Lainnya',          color: 'oklch(0.84 0.015 100)', value: 4 },
]
</script>

<template>
  <div>
    <div class="relative w-[140px] h-[140px] mx-auto mb-3.5">
      <svg width="140" height="140" viewBox="0 0 140 140" class="-rotate-90">
        <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.94 0.03 155)" stroke-width="18" />
        <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.45 0.10 155)" stroke-width="18"
                stroke-dasharray="140 352" stroke-dashoffset="0" stroke-linecap="round" />
        <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.50 0.09 200)" stroke-width="18"
                stroke-dasharray="80 352" stroke-dashoffset="-140" stroke-linecap="round" />
        <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.60 0.10 78)" stroke-width="18"
                stroke-dasharray="65 352" stroke-dashoffset="-220" stroke-linecap="round" />
        <circle cx="70" cy="70" r="56" fill="none" stroke="oklch(0.50 0.10 30)" stroke-width="18"
                stroke-dasharray="40 352" stroke-dashoffset="-285" stroke-linecap="round" />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div class="font-serif text-2xl font-bold">48</div>
        <div class="text-[10px] text-cms-muted uppercase tracking-[0.5px] font-semibold">Kegiatan</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div
        v-for="row in legend"
        :key="row.name"
        class="flex items-center gap-2.5 text-[13px]"
      >
        <span class="w-2.5 h-2.5 rounded-[3px]" :style="{ background: row.color }" />
        <span class="flex-1 text-cms-ink-2">{{ row.name }}</span>
        <span class="font-bold text-cms-ink">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>
