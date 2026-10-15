<script setup lang="ts">
import {
  DUTY_ROLE_LABELS,
  DUTY_SERVICE_LABELS,
  DUTY_SERVICE_ORDER,
  type DutyRole,
  type DutyService,
} from '#shared/utils/duties'

export interface DutyRow {
  id: string
  date: string
  service: DutyService
  role: DutyRole
  personName: string
  phone: string | null
  topic: string | null
  notes: string | null
}

const props = defineProps<{ date: string, items: DutyRow[], isToday: boolean, canEdit: boolean }>()
const emit = defineEmits<{
  add: [preset: { date: string, service?: DutyService }]
  edit: [duty: DutyRow]
  remove: [duty: DutyRow]
}>()

const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const dow = computed(() => new Date(`${props.date}T00:00:00Z`).getUTCDay())
const isFriday = computed(() => dow.value === 5)
const parts = computed(() => dateParts(props.date))

const groups = computed(() => {
  const map = new Map<DutyService, DutyRow[]>()
  for (const d of props.items) {
    const list = map.get(d.service) ?? []
    list.push(d)
    map.set(d.service, list)
  }
  return [...map.entries()]
    .sort(([a], [b]) => DUTY_SERVICE_ORDER[a] - DUTY_SERVICE_ORDER[b])
    .map(([service, list]) => ({ service, list }))
})
</script>

<template>
  <section
    :class="[
      'bg-cms-surface border rounded-cms-lg overflow-hidden',
      isToday ? 'border-cms-green-500 ring-2 ring-cms-green-100' : isFriday ? 'border-cms-gold' : 'border-cms-border',
    ]"
    :data-testid="`duty-day-${date}`"
  >
    <div class="flex flex-col md:flex-row">
      <!-- Date tile -->
      <div
        :class="[
          'flex items-center md:items-start gap-3 px-4 py-3 md:w-[170px] shrink-0 border-b md:border-b-0 md:border-r',
          isFriday ? 'bg-cms-gold-soft/60 border-cms-gold/40' : isToday ? 'bg-cms-green-50 border-cms-green-100' : 'bg-cms-surface-2 border-cms-border',
        ]"
      >
        <div class="font-serif text-[28px] leading-none font-semibold text-cms-ink w-9 shrink-0">{{ parts.d }}</div>
        <div class="min-w-0">
          <div :class="['font-semibold text-[14px] leading-tight', isFriday ? 'text-cms-gold-ink' : 'text-cms-ink']">{{ WEEKDAYS[dow] }}</div>
          <div class="text-[12px] text-cms-muted">{{ parts.m }}</div>
        </div>
        <UBadge v-if="isToday" color="primary" variant="solid" size="sm" class="rounded-full ml-auto md:ml-0 shrink-0">Hari ini</UBadge>
      </div>

      <!-- Services -->
      <div class="flex-1 min-w-0 p-3 md:p-4">
        <div v-if="!groups.length" class="h-full min-h-[36px] flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-cms-muted-2 px-1">
          <span>Belum ada petugas.</span>
          <UButton
            v-if="canEdit"
            icon="i-lucide-plus"
            size="xs"
            color="primary"
            variant="ghost"
            label="Tambah petugas"
            @click="emit('add', { date })"
          />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
          <div
            v-for="g in groups"
            :key="g.service"
            :class="[
              'rounded-cms border p-3',
              g.service === 'jumuah' ? 'bg-cms-gold-soft/40 border-cms-gold/50' : 'bg-cms-surface border-cms-border',
            ]"
          >
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <div class="text-[12px] uppercase tracking-[0.6px] font-semibold text-cms-green-700">
                {{ DUTY_SERVICE_LABELS[g.service] }}
              </div>
              <UButton
                v-if="canEdit"
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                :aria-label="`Tambah petugas ${DUTY_SERVICE_LABELS[g.service]}`"
                @click="emit('add', { date, service: g.service })"
              />
            </div>
            <ul class="m-0 p-0 list-none divide-y divide-cms-border/70">
              <li v-for="d in g.list" :key="d.id" class="group flex items-start gap-2 py-1.5">
                <div class="min-w-0 flex-1">
                  <div class="text-[11px] text-cms-muted font-medium">{{ DUTY_ROLE_LABELS[d.role] }}</div>
                  <div class="text-[14px] font-semibold text-cms-ink break-words">{{ d.personName }}</div>
                  <div v-if="d.topic" class="text-[12.5px] text-cms-ink-2 italic break-words">“{{ d.topic }}”</div>
                  <div v-if="d.phone || d.notes" class="text-[11.5px] text-cms-muted mt-0.5 break-words">
                    <span v-if="d.phone" class="inline-flex items-center gap-1 mr-2">
                      <Icon name="lucide:phone" size="11" />{{ d.phone }}
                    </span>
                    <span v-if="d.notes">{{ d.notes }}</span>
                  </div>
                </div>
                <div v-if="canEdit" class="flex shrink-0 -mr-1">
                  <UButton
                    icon="i-lucide-pencil"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    square
                    :aria-label="`Ubah ${d.personName}`"
                    @click="emit('edit', d)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    square
                    :aria-label="`Hapus ${d.personName}`"
                    @click="emit('remove', d)"
                  />
                </div>
              </li>
            </ul>
          </div>
          <button
            v-if="canEdit"
            type="button"
            class="rounded-cms border border-dashed border-cms-border-strong text-cms-muted hover:text-cms-green-700 hover:border-cms-green-500 hover:bg-cms-green-50 transition-colors min-h-[56px] flex items-center justify-center gap-1.5 text-[13px] font-medium"
            @click="emit('add', { date })"
          >
            <Icon name="lucide:plus" size="15" />
            Tambah petugas
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
