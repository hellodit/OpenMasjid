<script setup lang="ts">
defineProps<{ eyebrow: string, title: string, description?: string }>()
</script>

<template>
  <div class="flex items-end justify-between gap-4 mb-6">
    <div>
      <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-1.5 flex items-center">
        {{ eyebrow }}
      </div>
      <h1 class="font-serif text-[32px] font-semibold m-0 mb-1.5 tracking-[-0.4px]">
        {{ title }}
      </h1>
      <p v-if="description" class="m-0 text-cms-muted text-sm max-w-[540px]">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex gap-2.5 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
