<script setup lang="ts">
import { DUTY_ROLE_LABELS } from '#shared/utils/duties'
import { formatDate } from '~/utils/format'
import type { PublicDuty } from '~/utils/duty-roster'
import { relativeDayLabel } from '~/utils/duty-roster'

/** Friday prayer officials (khatib, imam, muadzin, bilal) + sermon theme. */
const props = defineProps<{
  date: string
  today: string
  /** `jumuah` duties of `date`, already in role order. */
  items: PublicDuty[]
}>()

const topic = computed(() => props.items.find(d => d.role === 'khatib' && d.topic)?.topic
  ?? props.items.find(d => d.topic)?.topic
  ?? null)
const relative = computed(() => {
  const rel = relativeDayLabel(props.date, props.today)
  return rel ? `${rel} · ` : ''
})

const ROLE_ICONS: Partial<Record<PublicDuty['role'], string>> = {
  khatib: 'lucide:mic',
  imam: 'lucide:user-round',
  muadzin: 'lucide:megaphone',
  bilal: 'lucide:bell',
}
</script>

<template>
  <div class="bg-white rounded-cms-lg border border-cms-border shadow-cms overflow-hidden">
    <div class="relative overflow-hidden bg-cms-green-900 text-white px-4 py-3.5">
      <div class="absolute inset-0 cms-pattern-khatam opacity-[0.14] pointer-events-none" aria-hidden="true" />
      <div class="relative flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[10.5px] uppercase tracking-[1.4px] text-cms-gold-soft font-semibold">
            {{ relative }}Petugas Jum'at
          </div>
          <div class="font-serif text-[17px] font-semibold leading-tight mt-0.5">
            Jum'at, {{ formatDate(date) }}
          </div>
        </div>
        <span class="font-arab text-[20px] text-cms-gold shrink-0" aria-hidden="true">الجمعة</span>
      </div>
    </div>

    <div v-if="topic" class="px-4 py-3 bg-cms-gold-soft/50 border-b border-cms-border">
      <div class="text-[10.5px] uppercase tracking-[0.8px] text-cms-gold-ink font-semibold">
        Tema khutbah
      </div>
      <div class="font-serif text-[15px] font-semibold text-cms-ink leading-snug mt-0.5">
        “{{ topic }}”
      </div>
    </div>

    <ul class="grid grid-cols-1 min-[420px]:grid-cols-2 divide-y min-[420px]:divide-y-0 divide-cms-border">
      <li
        v-for="(d, i) in items"
        :key="d.id"
        class="flex items-center gap-3 px-4 py-3 border-cms-border"
        :class="[
          i % 2 === 0 ? 'min-[420px]:border-r' : '',
          i >= 2 ? 'min-[420px]:border-t' : '',
        ]"
      >
        <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
          <Icon :name="ROLE_ICONS[d.role] ?? 'lucide:user'" size="16" />
        </div>
        <div class="min-w-0">
          <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">
            {{ DUTY_ROLE_LABELS[d.role] }}
          </div>
          <div class="text-[14px] font-medium leading-snug break-words">
            {{ d.personName }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
