<script setup lang="ts">
import type { AdminEvent } from '~/composables/useAdminMock'

defineProps<{ ev: AdminEvent }>()
</script>

<template>
  <article
    class="event-card group bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:border-cms-green-300 hover:shadow-cms"
  >
    <!-- Banner -->
    <div :class="['relative h-[140px] overflow-hidden text-white', `cms-banner-${ev.cat}`]">
      <div class="cms-pattern-strip absolute inset-0 opacity-55" />
      <div class="absolute top-3 inset-x-3 flex justify-between items-center z-[2]">
        <span class="bg-white/20 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.4px] border border-white/25">
          {{ ev.catName }}
        </span>
        <div class="bg-white text-cms-ink rounded-[10px] px-2.5 py-1.5 text-center leading-none font-bold flex flex-col gap-0.5 shadow-cms-sm">
          <span class="font-serif text-[18px]">{{ ev.d }}</span>
          <span class="text-[10px] text-cms-muted uppercase tracking-[0.5px]">{{ ev.m }}</span>
        </div>
      </div>
      <div class="absolute bottom-2 right-3.5 text-[18px] text-white/40 font-serif z-[2]">
        {{ ev.arabic }}
      </div>
    </div>

    <!-- Body -->
    <div class="p-4 pt-4 pb-3.5 flex-1 flex flex-col">
      <h3 class="font-serif text-[18px] font-semibold m-0 mb-1 leading-[1.25] tracking-[-0.2px]">
        {{ ev.title }}
      </h3>
      <div class="text-cms-muted text-[13px] mb-3">{{ ev.speaker }}</div>

      <div class="mt-auto flex flex-col gap-1.5 text-[12.5px] text-cms-ink-2">
        <div class="flex items-center gap-2">
          <Icon name="lucide:clock" size="14" class="text-cms-green-700 shrink-0" />
          <span>{{ ev.day }} • {{ ev.time }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="lucide:map-pin" size="14" class="text-cms-green-700 shrink-0" />
          <span>{{ ev.location }}</span>
        </div>
      </div>

      <div class="border-t border-dashed border-cms-border mt-3.5 pt-3 flex justify-between items-center">
        <AdminStatusBadge :status="ev.status" />
        <AdminCapacityBar :attended="ev.attended" :capacity="ev.capacity" />
      </div>
    </div>
  </article>
</template>
