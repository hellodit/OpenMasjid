<script setup lang="ts">
defineProps<{ title: string, description: string }>()
const model = defineModel<boolean>({ required: true })
</script>

<template>
  <label
    :class="[
      'flex justify-between items-center gap-3 px-4 py-3.5 border rounded-cms transition-colors cursor-pointer',
      model ? 'bg-cms-green-50 border-cms-green-300' : 'bg-cms-surface border-cms-border',
    ]"
  >
    <div>
      <div class="font-semibold text-sm">{{ title }}</div>
      <div class="text-cms-muted text-[12px] mt-0.5">{{ description }}</div>
    </div>
    <USwitch v-model="model" />
  </label>
</template>
