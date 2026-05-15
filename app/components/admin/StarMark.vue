<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 22 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2 L14.5 7 L20 7 L20 12.5 L22 14 L20 15.5 L20 21 L14.5 21 L12 22 L9.5 21 L4 21 L4 15.5 L2 14 L4 12.5 L4 7 L9.5 7 Z" />
  </svg>
</template>
