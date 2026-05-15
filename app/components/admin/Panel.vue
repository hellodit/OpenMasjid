<script setup lang="ts">
defineProps<{ title?: string, subtitle?: string }>()
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6">
    <div v-if="title || $slots.head" class="flex items-end justify-between mb-4">
      <div v-if="title">
        <h3 class="font-serif text-[18px] m-0 font-semibold">{{ title }}</h3>
        <p v-if="subtitle" class="text-cms-muted text-[13px] m-0 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="head" />
    </div>
    <slot />
  </div>
</template>
