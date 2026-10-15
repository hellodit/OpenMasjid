<script setup lang="ts">
import type { CheckInOutcome, CheckInResult } from './ResultCard.vue'

defineProps<{ items: CheckInResult[] }>()

const OUTCOME_LABELS: Record<CheckInOutcome, string> = {
  success: 'Kehadiran dicatat',
  already: 'Sudah check-in sebelumnya',
  error: 'Check-in gagal',
}
const ICONS = {
  success: { name: 'lucide:circle-check-big', class: 'text-cms-green-700' },
  already: { name: 'lucide:history', class: 'text-cms-gold-ink' },
  error: { name: 'lucide:circle-x', class: 'text-cms-rose' },
} as const
const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-5">
    <h3 class="font-serif text-[17px] font-semibold m-0 mb-1">Riwayat Pindaian</h3>
    <p class="m-0 mb-3 text-[12px] text-cms-muted">20 pindaian terakhir di perangkat ini (hilang saat halaman dimuat ulang).</p>

    <p v-if="!items.length" class="m-0 py-6 text-center text-sm text-cms-muted">Belum ada tiket yang dipindai.</p>

    <ul v-else class="list-none m-0 p-0 divide-y divide-cms-border">
      <li v-for="it in items" :key="it.id" class="flex items-center gap-3 py-2.5">
        <Icon :name="ICONS[it.kind].name" size="18" :class="['shrink-0', ICONS[it.kind].class]" />
        <div class="min-w-0 flex-1">
          <div class="text-[14px] font-semibold text-cms-ink truncate">
            {{ it.attendee?.name ?? OUTCOME_LABELS[it.kind] }}
          </div>
          <div class="text-[12px] text-cms-muted truncate">
            <template v-if="it.kind === 'error'">{{ it.message }}</template>
            <template v-else>{{ OUTCOME_LABELS[it.kind] }}<template v-if="it.event"> · {{ it.event.title }}</template></template>
          </div>
        </div>
        <span class="text-[12px] text-cms-muted tabular-nums shrink-0">{{ timeFmt.format(it.at) }}</span>
      </li>
    </ul>
  </div>
</template>
