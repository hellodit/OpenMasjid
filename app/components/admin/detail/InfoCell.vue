<script setup lang="ts">
defineProps<{ icon: string, label: string, value: string, sub?: string }>()
</script>

<template>
  <div class="flex gap-3 p-3 border border-cms-border rounded-cms bg-cms-surface-2">
    <div class="w-[38px] h-[38px] shrink-0 rounded-[10px] bg-cms-green-100 text-cms-green-800 grid place-items-center">
      <Icon :name="icon" size="18" />
    </div>
    <div>
      <div class="text-[11px] text-cms-muted uppercase tracking-[0.4px] font-semibold">{{ label }}</div>
      <div class="font-semibold text-cms-ink mt-0.5 text-sm">{{ value }}</div>
      <div v-if="sub" class="text-[12px] text-cms-muted">{{ sub }}</div>
    </div>
  </div>
</template>
