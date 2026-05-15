<script setup lang="ts">
import type { CategoryId } from '~/composables/useAdminMock'

defineProps<{
  id: CategoryId
  icon: string
  name: string
  ar: string
  desc: string
  events: number
  attend: number
  growth: string
}>()
</script>

<template>
  <div :class="['relative rounded-cms-lg p-6 text-white overflow-hidden min-h-[200px] flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-cms', `cms-banner-${id}`]">
    <div class="cms-pattern-strip absolute inset-0 opacity-50" />
    <div class="relative z-[1] flex flex-col h-full">
      <div class="flex items-start justify-between">
        <div class="w-12 h-12 rounded-xl bg-white/20 border border-white/25 grid place-items-center">
          <Icon :name="icon" size="24" />
        </div>
        <button
          type="button"
          class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white grid place-items-center hover:bg-white/20"
        >
          <Icon name="lucide:settings" size="14" />
        </button>
      </div>
      <h3 class="font-serif text-[22px] mt-4.5 mb-1 font-semibold" style="margin-top:18px">{{ name }}</h3>
      <div class="font-serif text-[16px] opacity-65 mb-3.5">{{ ar }}</div>
      <div class="text-[13px] opacity-85 leading-relaxed flex-1">{{ desc }}</div>

      <div class="grid grid-cols-3 gap-2.5 mt-4.5 pt-3.5 border-t border-white/15" style="margin-top:18px">
        <div>
          <div class="text-[10px] opacity-70 uppercase tracking-[0.5px] font-semibold">Kegiatan</div>
          <div class="font-serif text-[20px] font-bold leading-none mt-1">{{ events }}</div>
        </div>
        <div>
          <div class="text-[10px] opacity-70 uppercase tracking-[0.5px] font-semibold">Hadirin</div>
          <div class="font-serif text-[20px] font-bold leading-none mt-1">{{ attend }}</div>
        </div>
        <div>
          <div class="text-[10px] opacity-70 uppercase tracking-[0.5px] font-semibold">Tren</div>
          <div class="font-serif text-[20px] font-bold leading-none mt-1">{{ growth }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
