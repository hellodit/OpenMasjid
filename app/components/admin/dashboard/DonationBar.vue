<script setup lang="ts">
const props = defineProps<{
  name: string
  amount: string
  pct: number
  caption: string
}>()
</script>

<template>
  <div class="bg-cms-surface-2 border border-cms-border rounded-cms px-4 py-3.5 mb-2.5">
    <div class="flex justify-between items-center mb-2">
      <div class="font-semibold text-[13.5px]">{{ name }}</div>
      <div class="font-serif font-bold text-sm text-cms-green-700">{{ amount }}</div>
    </div>
    <div class="h-1.5 bg-cms-green-100 rounded-md overflow-hidden">
      <i class="block h-full cms-meter-grad" :style="{ width: pct + '%' }" />
    </div>
    <div class="text-[11.5px] text-cms-muted mt-1">{{ caption }}</div>
  </div>
</template>
