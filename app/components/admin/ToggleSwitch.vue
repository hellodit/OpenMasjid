<script setup lang="ts">
const props = defineProps<{ modelValue: boolean, label?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const toggle = () => emit('update:modelValue', !props.modelValue)
</script>

<template>
  <button
    type="button"
    :class="['inline-flex items-center gap-2.5 cursor-pointer select-none', $attrs.class]"
    @click="toggle"
  >
    <span
      :class="[
        'relative w-[38px] h-[22px] rounded-full transition-colors',
        modelValue ? 'bg-cms-green-700' : 'bg-[oklch(0.86_0.01_100)]',
      ]"
    >
      <span
        :class="[
          'absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-cms-sm transition-all',
          modelValue ? 'left-[18px]' : 'left-0.5',
        ]"
      />
    </span>
    <span v-if="label" class="text-[13px] font-medium">{{ label }}</span>
  </button>
</template>
