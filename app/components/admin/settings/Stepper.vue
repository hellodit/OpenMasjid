<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: number
  suffix?: string
  showSign?: boolean
  min?: number
}>(), {
  suffix: 'mnt',
  showSign: false,
  min: Number.NEGATIVE_INFINITY,
})
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const dec = (props: any) => emit('update:modelValue', Math.max(props.min, props.modelValue - 1))
</script>

<template>
  <div class="inline-flex items-center border border-cms-border rounded-lg overflow-hidden bg-cms-surface h-8">
    <button
      type="button"
      class="w-7 h-[30px] bg-transparent text-cms-ink-2 text-base font-bold leading-none hover:bg-cms-green-50 hover:text-cms-green-800"
      @click="$emit('update:modelValue', Math.max(min, modelValue - 1))"
    >
      −
    </button>
    <div class="min-w-[64px] px-1.5 text-center font-mono text-[12px] font-semibold text-cms-ink border-l border-r border-cms-border h-[30px] leading-[30px]">
      {{ showSign && modelValue > 0 ? '+' : '' }}{{ modelValue }} {{ suffix }}
    </div>
    <button
      type="button"
      class="w-7 h-[30px] bg-transparent text-cms-ink-2 text-base font-bold leading-none hover:bg-cms-green-50 hover:text-cms-green-800"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      +
    </button>
  </div>
</template>
