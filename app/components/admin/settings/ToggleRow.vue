<script setup lang="ts">
defineProps<{ modelValue: boolean, title: string, description: string }>()
defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-3.5 border-t border-dashed border-cms-border first:border-t-0 first:pt-1 last:pb-0">
    <div>
      <div class="font-semibold text-[13.5px] text-cms-ink">{{ title }}</div>
      <div class="text-[12.5px] text-cms-muted mt-0.5 max-w-[360px]">{{ description }}</div>
    </div>
    <AdminToggleSwitch :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
  </div>
</template>
