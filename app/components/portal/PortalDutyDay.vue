<script setup lang="ts">
import { DUTY_ROLE_LABELS, DUTY_SERVICE_LABELS } from '#shared/utils/duties'
import { dateParts } from '~/utils/format'
import type { DutyDayGroup } from '~/utils/duty-roster'
import { isFriday, relativeDayLabel } from '~/utils/duty-roster'

/** One day of the duty roster: date block + services → roles. */
const props = withDefaults(defineProps<{
  day: DutyDayGroup
  today: string
  /** Compact: one line per service (portal home). */
  compact?: boolean
}>(), { compact: false })

const parts = computed(() => dateParts(props.day.date))
const friday = computed(() => isFriday(props.day.date))
const relative = computed(() => relativeDayLabel(props.day.date, props.today))
const isPast = computed(() => props.day.date < props.today)
</script>

<template>
  <div
    class="flex gap-3 p-4"
    :class="[
      friday ? 'bg-cms-gold-soft/40' : '',
      isPast ? 'opacity-60' : '',
    ]"
  >
    <div
      class="shrink-0 w-14 rounded-cms border text-center py-2 self-start"
      :class="friday ? 'bg-cms-gold-soft border-cms-gold/40' : 'bg-cms-green-50 border-cms-green-100'"
    >
      <div
        class="text-[10.5px] uppercase tracking-[0.6px] font-semibold"
        :class="friday ? 'text-cms-gold-ink' : 'text-cms-green-700'"
      >
        {{ parts.m }}
      </div>
      <div class="font-serif text-[22px] font-semibold text-cms-green-900 leading-none mt-0.5">
        {{ parts.d }}
      </div>
      <div class="text-[10px] text-cms-muted mt-1">{{ parts.day }}</div>
    </div>

    <div class="min-w-0 flex-1">
      <div v-if="relative" class="mb-1.5">
        <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.4px] bg-cms-green-100 text-cms-green-800">
          {{ relative }}
        </span>
      </div>

      <!-- Compact: "Subuh — Imam: …, Muadzin: …" -->
      <ul v-if="compact" class="space-y-1">
        <li v-for="s in day.services" :key="s.service" class="text-[12.5px] leading-snug">
          <span class="font-semibold text-cms-ink">{{ DUTY_SERVICE_LABELS[s.service] }}</span>
          <span class="text-cms-muted"> — </span>
          <span class="text-cms-ink-2">
            <template v-for="(d, i) in s.items" :key="d.id">
              <template v-if="i">, </template>
              <span class="text-cms-muted">{{ DUTY_ROLE_LABELS[d.role] }}:</span> {{ d.personName }}
            </template>
          </span>
        </li>
      </ul>

      <!-- Full: service heading + role rows -->
      <div v-else class="space-y-3">
        <div v-for="s in day.services" :key="s.service">
          <div
            class="text-[11px] uppercase tracking-[0.8px] font-semibold"
            :class="s.service === 'jumuah' ? 'text-cms-gold-ink' : 'text-cms-green-700'"
          >
            {{ DUTY_SERVICE_LABELS[s.service] }}
          </div>
          <dl class="mt-1 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-0.5 text-[13px]">
            <template v-for="d in s.items" :key="d.id">
              <dt class="text-cms-muted">{{ DUTY_ROLE_LABELS[d.role] }}</dt>
              <dd class="font-medium text-cms-ink break-words">{{ d.personName }}</dd>
            </template>
          </dl>
          <div v-if="s.topic" class="mt-1 text-[12px] text-cms-ink-2 italic">
            Tema: “{{ s.topic }}”
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
