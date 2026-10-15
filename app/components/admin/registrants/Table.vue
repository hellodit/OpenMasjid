<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { InternalApi } from 'nitropack/types'
import { formatDate, initials, timeAgo } from '~/utils/format'
import { REGISTRANT_STATUS_LABELS, type RegistrantStatus } from '#shared/utils/events'

export type RegistrantRow = InternalApi['/api/admin/registrants']['get']['data'][number]
export type RegistrantAction = 'check-in' | 'undo-check-in' | 'cancel' | 'restore'

defineProps<{
  rows: RegistrantRow[]
  canEdit: boolean
  busyId?: string | null
}>()
const emit = defineEmits<{ action: [row: RegistrantRow, action: RegistrantAction] }>()

const statusColor: Record<RegistrantStatus, 'primary' | 'info' | 'error'> = {
  confirmed: 'primary',
  attended: 'info',
  cancelled: 'error',
}

function actionsFor(row: RegistrantRow): DropdownMenuItem[][] {
  const run = (action: RegistrantAction) => () => emit('action', row, action)
  if (row.status === 'cancelled') {
    return [[{ label: 'Pulihkan pendaftaran', icon: 'i-lucide-rotate-ccw', onSelect: run('restore') }]]
  }
  const main: DropdownMenuItem[] = row.status === 'attended'
    ? [{ label: 'Batalkan check-in', icon: 'i-lucide-undo-2', onSelect: run('undo-check-in') }]
    : [{ label: 'Check-in (hadir)', icon: 'i-lucide-check-check', onSelect: run('check-in') }]
  return [main, [{ label: 'Batalkan pendaftaran', icon: 'i-lucide-x', color: 'error', onSelect: run('cancel') }]]
}

const th = 'text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border'
const td = (i: number, len: number) => ['px-4 py-3.5 text-[13.5px] align-middle', i < len - 1 ? 'border-b border-cms-border' : '']
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg overflow-x-auto">
    <table class="w-full border-separate border-spacing-0 min-w-[860px]">
      <thead>
        <tr>
          <th :class="th">Pendaftar</th>
          <th :class="th">Telepon</th>
          <th :class="th">Kegiatan</th>
          <th :class="th">Mendaftar</th>
          <th :class="th">Status</th>
          <th v-if="canEdit" :class="[th, 'w-12']" />
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td :colspan="canEdit ? 6 : 5" class="px-4 py-12 text-center text-cms-muted text-[13.5px]">
            <Icon name="lucide:users" size="28" class="mx-auto mb-2 opacity-60" />
            <div>Tidak ada pendaftar yang cocok dengan filter.</div>
          </td>
        </tr>
        <tr
          v-for="(r, i) in rows"
          :key="r.id"
          class="transition-colors hover:bg-cms-green-50"
        >
          <td :class="td(i, rows.length)">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full bg-cms-green-100 text-cms-green-800 grid place-items-center font-semibold text-[12.5px] shrink-0">
                {{ initials(r.user.fullName) || '?' }}
              </div>
              <div class="min-w-0">
                <div class="font-semibold truncate">{{ r.user.fullName }}</div>
                <div class="text-[12px] text-cms-muted truncate">{{ r.user.email }}</div>
              </div>
            </div>
          </td>
          <td :class="td(i, rows.length)">
            <a v-if="r.user.phone" :href="`tel:${r.user.phone}`" class="text-cms-ink-2 hover:text-cms-green-700 whitespace-nowrap">
              {{ r.user.phone }}
            </a>
            <span v-else class="text-cms-muted">—</span>
          </td>
          <td :class="td(i, rows.length)">
            <NuxtLink :to="`/admin/events/${r.event.id}`" class="font-semibold hover:text-cms-green-700">
              {{ r.event.title }}
            </NuxtLink>
            <div class="text-[12px] text-cms-muted">
              {{ r.category.name }} · {{ formatDate(r.event.startDate) }}
            </div>
          </td>
          <td :class="[td(i, rows.length), 'text-[12.5px] text-cms-muted whitespace-nowrap']">
            {{ timeAgo(r.registeredAt) }}
          </td>
          <td :class="td(i, rows.length)">
            <UBadge
              :color="statusColor[r.status]"
              variant="soft"
              class="uppercase tracking-[0.3px] font-semibold rounded-full"
            >
              {{ REGISTRANT_STATUS_LABELS[r.status] }}
            </UBadge>
          </td>
          <td v-if="canEdit" :class="[td(i, rows.length), 'text-right']">
            <UDropdownMenu :items="actionsFor(r)" :content="{ align: 'end' }">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                :loading="busyId === r.id"
                aria-label="Aksi pendaftar"
              />
            </UDropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
