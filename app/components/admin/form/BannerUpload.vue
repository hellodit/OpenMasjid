<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: string
}>(), {
  title: 'Tarik & lepas berkas, atau pilih dari komputer',
  description: 'PNG · JPG · WEBP — Maksimal 4MB',
  icon: 'lucide:upload',
})
</script>

<template>
  <div class="cms-pattern-fade relative overflow-hidden border-[1.5px] border-dashed border-cms-green-300 bg-cms-green-50 rounded-cms text-center px-5 py-7">
    <div class="relative z-[2] w-12 h-12 mx-auto mb-2.5 rounded-xl bg-white border border-cms-border grid place-items-center text-cms-green-700">
      <Icon :name="icon" size="20" />
    </div>
    <div class="relative z-[2] font-semibold">
      <slot>{{ title }}</slot>
    </div>
    <div class="relative z-[2] text-[12px] text-cms-muted mt-0.5">
      {{ description }}
    </div>
  </div>
</template>
