<script setup lang="ts">
const props = defineProps<{ series: { day: string, count: number }[] }>()

const max = computed(() => Math.max(1, ...props.series.map(s => s.count)))
const bars = computed(() => props.series.map(s => ({
  key: s.day,
  label: dateParts(s.day).day.slice(0, 3),
  date: dateParts(s.day).d,
  value: s.count,
  pct: (s.count / max.value) * 100,
})))
</script>

<template>
  <div class="grid grid-cols-7 gap-2.5 items-end h-[180px] pt-6 pb-2">
    <div v-for="b in bars" :key="b.key" class="flex flex-col items-center gap-1.5 h-full">
      <div class="w-full flex items-end flex-1">
        <div
          class="cms-bar-grad rounded-t-md relative w-full min-h-[3px]"
          :style="{ height: b.pct + '%' }"
          :title="`${b.value} pendaftar`"
        >
          <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-cms-ink-2">{{ b.value }}</span>
        </div>
      </div>
      <div class="text-[11px] text-cms-muted font-medium leading-tight text-center">
        {{ b.label }}<br><span class="text-[10px]">{{ b.date }}</span>
      </div>
    </div>
  </div>
</template>
