<script setup lang="ts">
import type { EventListItem } from './EventCard.vue'

defineProps<{ events: EventListItem[] }>()
defineEmits<{ open: [id: string] }>()

const th = 'text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border'
const td = (last: boolean) => ['px-4 py-3.5 text-[13.5px] align-middle', last ? '' : 'border-b border-cms-border']
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden border-separate border-spacing-0">
      <thead>
        <tr>
          <th :class="[th, 'w-[32%]']">Kegiatan</th>
          <th :class="th">Kategori</th>
          <th :class="th">Jadwal</th>
          <th :class="th">Lokasi</th>
          <th :class="th">Kapasitas</th>
          <th :class="th">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(ev, i) in events"
          :key="ev.id"
          class="cursor-pointer transition-colors hover:bg-cms-green-50"
          @click="$emit('open', ev.id)"
        >
          <td :class="td(i === events.length - 1)">
            <div class="flex items-center gap-3">
              <div :class="['relative w-11 h-11 rounded-[10px] shrink-0 grid place-items-center text-white font-bold font-serif text-[16px] overflow-hidden', bannerClass(ev.category?.slug)]">
                <div class="cms-pattern-strip absolute inset-0 opacity-40" />
                <span class="relative z-[1]">{{ ev.title.charAt(0) }}</span>
              </div>
              <div>
                <div class="font-semibold text-cms-ink mb-0.5 flex items-center gap-1.5">
                  <Icon v-if="ev.isPinned" name="lucide:pin" size="13" class="text-cms-gold shrink-0" />
                  {{ ev.title }}
                </div>
                <div class="text-[12px] text-cms-muted">
                  {{ ev.speakers.map(s => s.name).join(', ') || '—' }}
                </div>
              </div>
            </div>
          </td>
          <td :class="td(i === events.length - 1)">
            <span class="inline-flex items-center gap-1.5 text-cms-ink-2">
              <Icon v-if="ev.category?.icon" :name="ev.category.icon" size="14" />
              {{ ev.category?.name ?? '—' }}
            </span>
          </td>
          <td :class="td(i === events.length - 1)">
            <div class="font-semibold">{{ formatDate(ev.startDate) }}</div>
            <div class="text-[12px] text-cms-muted">
              {{ dateParts(ev.startDate).day }}<template v-if="ev.startTime"> • {{ formatTimeRange(ev.startTime, ev.endTime) }}</template>
            </div>
          </td>
          <td :class="td(i === events.length - 1)">
            {{ ev.locationName || '—' }}
          </td>
          <td :class="td(i === events.length - 1)">
            <AdminCapacityBar v-if="ev.capacity" :attended="ev.registeredCount" :capacity="ev.capacity" />
            <span v-else class="text-[12px] text-cms-muted">{{ ev.registeredCount }} pendaftar</span>
          </td>
          <td :class="td(i === events.length - 1)">
            <AdminStatusBadge :status="ev.displayStatus" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
