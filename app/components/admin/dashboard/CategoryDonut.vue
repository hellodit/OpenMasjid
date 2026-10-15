<script setup lang="ts">
const props = defineProps<{ items: { slug: string, name: string, n: number }[] }>()

const PALETTE: Record<string, string> = {
  kajian: 'oklch(0.45 0.10 155)',
  tahsin: 'oklch(0.50 0.09 200)',
  tpa: 'oklch(0.60 0.10 78)',
  zakat: 'oklch(0.50 0.10 30)',
  muharram: 'oklch(0.40 0.08 290)',
  umum: 'oklch(0.70 0.04 145)',
}
const FALLBACK = ['oklch(0.55 0.08 250)', 'oklch(0.60 0.08 340)', 'oklch(0.65 0.06 110)', 'oklch(0.84 0.015 100)']

const R = 56
const C = 2 * Math.PI * R

const total = computed(() => props.items.reduce((s, i) => s + i.n, 0))

const legend = computed(() => {
  let fb = 0
  return props.items.map(i => ({
    ...i,
    color: PALETTE[i.slug] ?? FALLBACK[fb++ % FALLBACK.length]!,
  }))
})

const arcs = computed(() => {
  if (!total.value) return []
  let offset = 0
  return legend.value.filter(i => i.n > 0).map((i) => {
    const len = (i.n / total.value) * C
    const arc = { key: i.slug, color: i.color, dash: `${Math.max(len - 2, 0.5)} ${C}`, offset: -offset }
    offset += len
    return arc
  })
})
</script>

<template>
  <div>
    <div class="relative w-[140px] h-[140px] mx-auto mb-3.5">
      <svg width="140" height="140" viewBox="0 0 140 140" class="-rotate-90">
        <circle cx="70" cy="70" :r="R" fill="none" stroke="oklch(0.94 0.03 155)" stroke-width="18" />
        <circle
          v-for="a in arcs"
          :key="a.key"
          cx="70"
          cy="70"
          :r="R"
          fill="none"
          :stroke="a.color"
          stroke-width="18"
          :stroke-dasharray="a.dash"
          :stroke-dashoffset="a.offset"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div class="font-serif text-2xl font-bold">{{ total }}</div>
        <div class="text-[10px] text-cms-muted uppercase tracking-[0.5px] font-semibold">Kegiatan</div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <div
        v-for="row in legend"
        :key="row.slug"
        class="flex items-center gap-2.5 text-[13px]"
      >
        <span class="w-2.5 h-2.5 rounded-[3px]" :style="{ background: row.color }" />
        <span class="flex-1 text-cms-ink-2">{{ row.name }}</span>
        <span class="font-bold text-cms-ink">{{ row.n }}</span>
      </div>
    </div>
  </div>
</template>
