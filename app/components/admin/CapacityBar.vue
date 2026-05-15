<script setup lang="ts">
const props = defineProps<{ attended: number, capacity: number }>()

const pct = computed(() => Math.round((props.attended / props.capacity) * 100))
const fillClass = computed(() => {
  if (pct.value >= 100) return 'bg-cms-rose'
  if (pct.value >= 80) return 'bg-cms-gold'
  return 'bg-cms-green-700'
})
</script>

<template>
  <div class="flex items-center gap-2 text-[12px] text-cms-muted">
    <div class="w-[70px] h-[5px] rounded-[5px] bg-cms-green-100 overflow-hidden relative">
      <i
        :class="['block h-full rounded-[5px]', fillClass]"
        :style="{ width: Math.min(100, pct) + '%' }"
      />
    </div>
    <span>{{ attended }}/{{ capacity }}</span>
  </div>
</template>
