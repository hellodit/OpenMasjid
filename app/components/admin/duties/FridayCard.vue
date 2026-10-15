<script setup lang="ts">
import { DUTY_ROLES_BY_SERVICE, DUTY_ROLE_LABELS, type DutyRole } from '#shared/utils/duties'
import type { DutyRow } from './DaySection.vue'

const props = defineProps<{ date: string, items: DutyRow[], canEdit: boolean, title: string }>()
const emit = defineEmits<{
  add: [preset: { date: string, service: 'jumuah', role: DutyRole }]
  edit: [duty: DutyRow]
}>()

const ROLES = DUTY_ROLES_BY_SERVICE.jumuah
const ICONS: Partial<Record<DutyRole, string>> = {
  khatib: 'lucide:mic',
  imam: 'lucide:user-round',
  muadzin: 'lucide:megaphone',
  bilal: 'lucide:bell',
}

const slots = computed(() => ROLES.map(role => ({ role, duty: props.items.find(d => d.role === role) ?? null })))
const extras = computed(() => props.items.filter(d => !ROLES.includes(d.role)))
const filled = computed(() => slots.value.filter(s => s.duty).length)
</script>

<template>
  <section
    class="relative overflow-hidden rounded-cms-lg border border-cms-gold bg-gradient-to-br from-cms-gold-soft via-cms-surface to-cms-green-50 p-5 md:p-6 mb-5"
    data-testid="friday-card"
  >
    <div class="flex flex-wrap items-end justify-between gap-2 mb-4">
      <div>
        <div class="text-[12px] uppercase tracking-[1.5px] text-cms-gold-ink font-semibold mb-1">{{ title }}</div>
        <h2 class="font-serif text-[19px] sm:text-[22px] font-semibold m-0">Sholat Jum'at, {{ formatDate(date) }}</h2>
      </div>
      <UBadge :color="filled === ROLES.length ? 'primary' : 'warning'" variant="subtle" class="rounded-full">
        {{ filled }}/{{ ROLES.length }} petugas terisi
      </UBadge>
    </div>

    <div class="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
      <div
        v-for="s in slots"
        :key="s.role"
        :class="[
          'rounded-cms border p-3 sm:p-3.5 flex gap-3 items-start min-w-0',
          s.duty ? 'bg-cms-surface border-cms-border shadow-cms-sm' : 'bg-cms-surface/60 border-dashed border-cms-border-strong',
        ]"
        :data-testid="`friday-slot-${s.role}`"
      >
        <div
          :class="[
            'w-9 h-9 rounded-lg place-items-center shrink-0 hidden sm:grid',
            s.duty ? 'bg-cms-green-100 text-cms-green-700' : 'bg-cms-surface-2 text-cms-muted-2',
          ]"
        >
          <Icon :name="ICONS[s.role] ?? 'lucide:user-round'" size="17" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[11.5px] uppercase tracking-[0.5px] font-semibold text-cms-muted">{{ DUTY_ROLE_LABELS[s.role] }}</div>
          <template v-if="s.duty">
            <div class="font-semibold text-[15px] text-cms-ink break-words">{{ s.duty.personName }}</div>
            <div v-if="s.duty.topic" class="text-[12.5px] text-cms-ink-2 italic break-words mt-0.5">“{{ s.duty.topic }}”</div>
            <button
              v-if="canEdit"
              type="button"
              class="text-[12px] font-semibold text-cms-green-700 hover:underline mt-1"
              @click="emit('edit', s.duty)"
            >
              Ubah
            </button>
          </template>
          <template v-else>
            <div class="text-[14px] text-cms-muted-2 italic">Belum diisi</div>
            <UButton
              v-if="canEdit"
              icon="i-lucide-plus"
              size="xs"
              color="primary"
              variant="soft"
              label="Isi"
              class="mt-1.5"
              @click="emit('add', { date, service: 'jumuah', role: s.role })"
            />
          </template>
        </div>
      </div>
    </div>

    <p v-if="extras.length" class="text-[12.5px] text-cms-muted mt-3 mb-0">
      Petugas lain: {{ extras.map(d => `${d.personName} (${DUTY_ROLE_LABELS[d.role]})`).join(', ') }}
    </p>
  </section>
</template>
