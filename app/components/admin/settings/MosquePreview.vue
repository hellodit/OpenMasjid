<script setup lang="ts">
const props = defineProps<{ name: string, arabic?: string | null, city?: string | null, province?: string | null }>()
const place = computed(() => [props.city, props.province].filter(Boolean).join(', '))
</script>

<template>
  <div class="relative rounded-cms px-5 py-5.5 text-white text-center overflow-hidden cms-hero-grad-dark">
    <div class="cms-pattern-strip absolute inset-0 opacity-40" />
    <div class="relative z-[1]">
      <div class="w-[52px] h-[52px] rounded-xl bg-cms-gold text-cms-green-900 grid place-items-center mx-auto mb-3">
        <AdminStarMark :size="26" />
      </div>
      <div class="font-serif text-[18px] font-semibold leading-tight">{{ name || 'Nama masjid' }}</div>
      <div v-if="arabic" class="font-arab text-[18px] mt-1 text-[oklch(0.92_0.04_78)]" dir="rtl">{{ arabic }}</div>
      <div v-if="place" class="mt-3 text-[11.5px] text-[oklch(0.85_0.04_155)] inline-flex items-center gap-1.5">
        <Icon name="lucide:map-pin" size="11" /> {{ place }}
      </div>
    </div>
  </div>
</template>
