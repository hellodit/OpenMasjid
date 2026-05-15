<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  title: string
  description: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()
</script>

<template>
  <div
    :class="[
      'flex justify-between items-center px-4 py-3.5 border rounded-cms transition-colors',
      props.modelValue
        ? 'bg-cms-green-50 border-cms-green-300'
        : 'bg-cms-surface border-cms-border',
    ]"
  >
    <div>
      <div class="font-semibold text-sm">{{ title }}</div>
      <div class="text-cms-muted text-[12px] mt-0.5">{{ description }}</div>
    </div>
    <AdminToggleSwitch :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />
  </div>
</template>
