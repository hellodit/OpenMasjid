<script setup lang="ts">
import type { AdminEvent } from '~/composables/useAdminMock'

const props = defineProps<{ ev: AdminEvent, categoryIcon: string }>()

const initial = computed(() => {
  const last = props.ev.speaker.split(' ').slice(-1)[0] ?? ''
  return last.charAt(0)
})
</script>

<template>
  <div :class="['relative rounded-cms-lg text-white px-10 py-9 overflow-hidden mb-4.5 min-h-[220px]', `cms-banner-${ev.cat}`]" style="margin-bottom:18px">
    <div class="cms-pattern-strip absolute inset-0 opacity-40" />
    <div class="relative z-[1]">
      <div class="inline-flex items-center gap-1.5 bg-white/20 border border-white/25 text-white text-[11.5px] px-2.5 py-1 rounded-full uppercase tracking-[0.6px] font-semibold mb-3.5">
        <Icon :name="categoryIcon" size="12" />
        {{ ev.catName }}
      </div>
      <div class="font-serif text-[22px] text-white/65 mb-2 tracking-[1px]">
        {{ ev.arabic }}
      </div>
      <h1 class="font-serif text-[38px] font-semibold m-0 mb-2 tracking-[-0.5px] max-w-[720px] leading-[1.15]">
        {{ ev.title }}
      </h1>
      <div class="opacity-85 max-w-[640px] mt-1">
        {{ ev.day }}, {{ ev.date }} • {{ ev.time }}
      </div>
      <div class="flex items-center gap-3 mt-5">
        <div class="w-11 h-11 rounded-full bg-cms-gold border-2 border-white text-cms-green-900 grid place-items-center font-bold font-serif">
          {{ initial }}
        </div>
        <div>
          <div class="font-semibold text-[15px]">{{ ev.speaker }}</div>
          <div class="text-[12px] opacity-80">{{ ev.role }}</div>
        </div>
        <div class="ml-auto">
          <AdminStatusBadge :status="ev.status" />
        </div>
      </div>
    </div>
  </div>
</template>
