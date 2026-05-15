<script setup lang="ts">
import type { CategoryId } from '~/composables/useAdminMock'

const props = defineProps<{ modelValue: CategoryId }>()
defineEmits<{ 'update:modelValue': [v: CategoryId] }>()

const { CATEGORIES } = useAdminMock()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
    <button
      v-for="c in CATEGORIES"
      :key="c.id"
      type="button"
      :class="[
        'border rounded-cms p-3.5 text-center bg-cms-surface cursor-pointer transition-all flex flex-col items-center gap-1.5 active:translate-y-px',
        props.modelValue === c.id
          ? 'border-cms-green-700 bg-cms-green-50 shadow-[0_0_0_3px_oklch(0.85_0.06_155_/_0.4)]'
          : 'border-cms-border hover:border-cms-green-300 hover:bg-cms-green-50',
      ]"
      @click="$emit('update:modelValue', c.id)"
    >
      <div :class="['w-9 h-9 rounded-[10px] grid place-items-center text-white', `cms-banner-${c.id}`]">
        <Icon :name="c.icon" size="18" />
      </div>
      <div class="text-[12.5px] font-semibold">{{ c.name }}</div>
    </button>
  </div>
</template>
