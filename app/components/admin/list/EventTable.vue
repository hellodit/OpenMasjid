<script setup lang="ts">
import type { AdminEvent } from '~/composables/useAdminMock'

defineProps<{ events: AdminEvent[] }>()
defineEmits<{ open: [id: string] }>()

const { CATEGORIES } = useAdminMock()
const catOf = (id: AdminEvent['cat']) => CATEGORIES.find(c => c.id === id)
</script>

<template>
  <table class="w-full bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden border-separate border-spacing-0">
    <thead>
      <tr>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border w-[32%]">
          Kegiatan
        </th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">
          Kategori
        </th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">
          Jadwal
        </th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">
          Lokasi
        </th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">
          Kapasitas
        </th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">
          Status
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(ev, i) in events"
        :key="ev.id"
        class="cursor-pointer transition-colors hover:bg-cms-green-50"
        @click="$emit('open', ev.id)"
      >
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < events.length - 1 ? 'border-b border-cms-border' : '']">
          <div class="flex items-center gap-3">
            <div :class="['relative w-11 h-11 rounded-[10px] shrink-0 grid place-items-center text-white font-bold font-serif text-[16px] overflow-hidden', `cms-banner-${ev.cat}`]">
              <div class="cms-pattern-strip absolute inset-0 opacity-40" />
              <span class="relative z-[1]">{{ ev.title.charAt(0) }}</span>
            </div>
            <div>
              <div class="font-semibold text-cms-ink mb-0.5">{{ ev.title }}</div>
              <div class="text-[12px] text-cms-muted">{{ ev.speaker }}</div>
            </div>
          </div>
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < events.length - 1 ? 'border-b border-cms-border' : '']">
          <span class="inline-flex items-center gap-1.5 text-cms-ink-2">
            <Icon v-if="catOf(ev.cat)" :name="catOf(ev.cat)!.icon" size="14" />
            {{ ev.catName }}
          </span>
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < events.length - 1 ? 'border-b border-cms-border' : '']">
          <div class="font-semibold">{{ ev.date }}</div>
          <div class="text-[12px] text-cms-muted">{{ ev.time }}</div>
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < events.length - 1 ? 'border-b border-cms-border' : '']">
          {{ ev.location }}
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < events.length - 1 ? 'border-b border-cms-border' : '']">
          <AdminCapacityBar :attended="ev.attended" :capacity="ev.capacity" />
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < events.length - 1 ? 'border-b border-cms-border' : '']">
          <AdminStatusBadge :status="ev.status" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
