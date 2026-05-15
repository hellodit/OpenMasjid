<script setup lang="ts">
defineProps<{ title: string, description?: string }>()
</script>

<template>
  <section class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px]">
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 class="font-serif text-[18px] m-0 mb-1 font-semibold">{{ title }}</h3>
        <p v-if="description" class="text-cms-muted text-[13px] m-0">{{ description }}</p>
      </div>
      <slot name="aside" />
    </div>
    <slot />
  </section>
</template>
