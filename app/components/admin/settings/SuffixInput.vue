<script setup lang="ts">
defineProps<{
  modelValue: number | string
  suffix: string
  type?: 'number' | 'text'
  step?: number | string
}>()
defineEmits<{ 'update:modelValue': [v: number | string] }>()
</script>

<template>
  <div class="relative">
    <input
      :type="type ?? 'number'"
      :value="modelValue"
      :step="step"
      class="cms-input w-full h-[42px] pl-3.5 pr-[60px] border border-cms-border rounded-cms bg-cms-surface outline-none text-sm"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-cms-muted font-semibold tracking-[0.3px]">
      {{ suffix }}
    </span>
  </div>
</template>
