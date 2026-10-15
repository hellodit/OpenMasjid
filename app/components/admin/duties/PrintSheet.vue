<script setup lang="ts">
import { DUTY_ROLE_LABELS, DUTY_SERVICE_LABELS } from '#shared/utils/duties'
import type { DutyRow } from './DaySection.vue'

/** Clean weekly table, only visible when printing (see the page's print CSS). */
const props = defineProps<{ mosqueName: string, rangeLabel: string, days: string[], itemsByDate: Map<string, DutyRow[]> }>()

const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const weekday = (iso: string) => WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()]
const rows = computed(() => props.days.map(date => ({ date, items: props.itemsByDate.get(date) ?? [] })))
</script>

<template>
  <Teleport to="body">
    <div class="duty-print-sheet">
      <h1>Jadwal Petugas — {{ mosqueName }}</h1>
      <p class="sub">{{ rangeLabel }}</p>
      <table>
        <thead>
          <tr>
            <th style="width: 18%">Hari</th>
            <th style="width: 18%">Sholat</th>
            <th style="width: 16%">Tugas</th>
            <th>Petugas</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="r in rows" :key="r.date">
            <tr v-if="!r.items.length">
              <td><b>{{ weekday(r.date) }}</b><br>{{ formatDate(r.date) }}</td>
              <td colspan="3" class="empty">—</td>
            </tr>
            <tr v-for="(d, i) in r.items" :key="d.id">
              <td v-if="i === 0" :rowspan="r.items.length"><b>{{ weekday(r.date) }}</b><br>{{ formatDate(r.date) }}</td>
              <td>{{ DUTY_SERVICE_LABELS[d.service] }}</td>
              <td>{{ DUTY_ROLE_LABELS[d.role] }}</td>
              <td>
                {{ d.personName }}
                <span v-if="d.topic" class="topic"> — “{{ d.topic }}”</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
  </div>
  </Teleport>
</template>

<style>
.duty-print-sheet { display: none; }

@media print {
  @page { size: A4 portrait; margin: 14mm; }
  /* The sheet is teleported to <body>; print only it. */
  body:has(> .duty-print-sheet) > :not(.duty-print-sheet) { display: none !important; }
  .duty-print-sheet {
    display: block;
    width: 100%;
    color: #000;
    background: #fff;
    font-size: 11pt;
  }
  .duty-print-sheet h1 { font-size: 16pt; margin: 0 0 2pt; }
  .duty-print-sheet .sub { margin: 0 0 10pt; color: #444; }
  .duty-print-sheet table { width: 100%; border-collapse: collapse; }
  .duty-print-sheet th, .duty-print-sheet td { border: 1px solid #999; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  .duty-print-sheet th { background: #eee; }
  .duty-print-sheet tr { break-inside: avoid; }
  .duty-print-sheet .empty { color: #888; }
  .duty-print-sheet .topic { color: #444; font-style: italic; }
}
</style>
