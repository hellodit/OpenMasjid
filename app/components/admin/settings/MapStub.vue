<script setup lang="ts">
defineProps<{ title: string, description: string }>()
</script>

<template>
  <div class="cms-pattern-fade relative overflow-hidden mt-1.5 flex items-center gap-3.5 px-4 py-3.5 border border-cms-border rounded-cms bg-cms-green-50">
    <div class="relative z-[1] w-10 h-10 rounded-full bg-cms-green-700 text-white grid place-items-center shrink-0 shadow-[0_6px_14px_-6px_oklch(0.45_0.10_155_/_0.5)]">
      <Icon name="lucide:map-pin" size="18" />
    </div>
    <div class="relative z-[1] flex-1">
      <div class="font-semibold text-[13.5px]">{{ title }}</div>
      <div class="text-[12px] text-cms-muted mt-0.5">{{ description }}</div>
    </div>
    <AdminBtn size="sm" class="relative z-[1]">Sesuaikan di peta</AdminBtn>
  </div>
</template>
