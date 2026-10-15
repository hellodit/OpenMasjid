<script setup lang="ts">
import { bannerClass } from '~/utils/format'
defineProps<{
  categories: { id: string, slug: string, name: string, icon: string | null }[]
}>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
    <button
      v-for="c in categories"
      :key="c.id"
      type="button"
      :aria-pressed="model === c.id"
      :class="[
        'border rounded-cms p-3.5 text-center bg-cms-surface cursor-pointer transition-all flex flex-col items-center gap-1.5 active:translate-y-px',
        model === c.id
          ? 'border-cms-green-700 bg-cms-green-50 shadow-[0_0_0_3px_oklch(0.85_0.06_155_/_0.4)]'
          : 'border-cms-border hover:border-cms-green-300 hover:bg-cms-green-50',
      ]"
      @click="model = c.id"
    >
      <div :class="['w-9 h-9 rounded-[10px] grid place-items-center text-white', bannerClass(c.slug)]">
        <Icon :name="c.icon ?? 'lucide:tag'" size="18" />
      </div>
      <div class="text-[12.5px] font-semibold">{{ c.name }}</div>
    </button>
  </div>
</template>
