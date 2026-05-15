<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 mb-[18px]">
    <h3 class="font-serif text-[18px] m-0 mb-3 font-semibold">{{ title }}</h3>
    <slot />
  </div>
</template>
