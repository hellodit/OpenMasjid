<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  hint?: string
  help?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-[12.5px] font-semibold text-cms-ink-2 flex justify-between items-center">
      <span>
        {{ label }}
        <span v-if="required" class="text-cms-rose">*</span>
      </span>
      <span v-if="hint" class="font-normal text-[11.5px] text-cms-muted">{{ hint }}</span>
    </label>
    <slot />
    <div v-if="help" class="text-[11.5px] text-cms-muted">{{ help }}</div>
  </div>
</template>
