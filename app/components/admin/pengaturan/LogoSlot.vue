<script setup lang="ts">
defineProps<{ filename: string, size: string }>()
</script>

<template>
  <div class="flex items-center gap-3.5 p-3.5 bg-cms-surface-2 border border-cms-border rounded-cms mb-4">
    <div class="w-16 h-16 rounded-2xl bg-cms-green-700 text-cms-gold grid place-items-center shrink-0">
      <AdminStarMark :size="36" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-[13px]">{{ filename }}</div>
      <div class="text-[11.5px] text-cms-muted mt-0.5">{{ size }}</div>
      <div class="flex gap-1.5 mt-2">
        <AdminBtn size="sm"><Icon name="lucide:upload" size="12" /> Ganti</AdminBtn>
        <AdminBtn size="sm" variant="danger"><Icon name="lucide:trash-2" size="12" /></AdminBtn>
      </div>
    </div>
  </div>
</template>
