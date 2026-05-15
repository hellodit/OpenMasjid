<script setup lang="ts">
import { initials, regStatusLabel, type Registrant } from '~/composables/useAdminMock'

const props = defineProps<{
  rows: Registrant[]
  selected: Set<number>
}>()
const emit = defineEmits<{
  'toggle': [i: number]
  'toggleAll': []
}>()

const { CATEGORIES } = useAdminMock()
const catName = (id: Registrant['cat']) => CATEGORIES.find(c => c.id === id)?.name ?? ''

const allOn = computed(() => props.rows.length > 0 && props.rows.every((_, i) => props.selected.has(i)))

const statusCls: Record<Registrant['status'], string> = {
  confirmed: 'bg-cms-green-100 text-cms-green-800',
  pending:   'bg-cms-gold-soft text-cms-gold-ink',
  attended:  'bg-cms-info-soft text-cms-info',
  cancelled: 'bg-cms-rose-soft text-cms-rose',
}
</script>

<template>
  <table class="w-full bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden border-separate border-spacing-0">
    <thead>
      <tr>
        <th class="w-10 text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">
          <div
            :class="['w-[18px] h-[18px] border-[1.5px] rounded-[5px] grid place-items-center cursor-pointer', allOn ? 'bg-cms-green-700 border-cms-green-700 text-white' : 'bg-cms-surface border-cms-border-strong']"
            @click="emit('toggleAll')"
          >
            <Icon v-if="allOn" name="lucide:check" size="12" />
          </div>
        </th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Pendaftar</th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Kegiatan</th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Tanggal</th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Status</th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Mendaftar</th>
        <th class="text-left px-4 py-3.5 text-[11.5px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border" />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(r, i) in rows"
        :key="i"
        class="transition-colors hover:bg-cms-green-50"
      >
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <div
            :class="['w-[18px] h-[18px] border-[1.5px] rounded-[5px] grid place-items-center cursor-pointer', selected.has(i) ? 'bg-cms-green-700 border-cms-green-700 text-white' : 'bg-cms-surface border-cms-border-strong']"
            @click="emit('toggle', i)"
          >
            <Icon v-if="selected.has(i)" name="lucide:check" size="12" />
          </div>
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-cms-green-100 text-cms-green-800 grid place-items-center font-semibold text-[12.5px] shrink-0">
              {{ initials(r.name) }}
            </div>
            <div>
              <div class="font-semibold">{{ r.name }}</div>
              <div class="text-[12px] text-cms-muted">{{ r.email }}</div>
            </div>
          </div>
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <div class="font-semibold">{{ r.event }}</div>
          <div class="text-[12px] text-cms-muted">{{ catName(r.cat) }}</div>
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          {{ r.date }}
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <span :class="['inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-[0.3px]', statusCls[r.status]]">
            {{ regStatusLabel[r.status] }}
          </span>
        </td>
        <td :class="['px-4 py-3.5 text-[12.5px] align-middle text-cms-muted', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          {{ r.when }}
        </td>
        <td :class="['px-4 py-3.5 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <div class="flex gap-1">
            <button type="button" class="w-[30px] h-[30px] rounded-cms border border-cms-border bg-cms-surface grid place-items-center text-cms-ink-2 hover:bg-cms-surface-2" title="Lihat">
              <Icon name="lucide:eye" size="14" />
            </button>
            <button type="button" class="w-[30px] h-[30px] rounded-cms border border-cms-border bg-cms-surface grid place-items-center text-cms-ink-2 hover:bg-cms-surface-2" title="Kirim email">
              <Icon name="lucide:mail" size="14" />
            </button>
            <button type="button" class="w-[30px] h-[30px] rounded-cms border border-cms-border bg-cms-surface grid place-items-center text-cms-ink-2 hover:bg-cms-surface-2" title="Hubungi">
              <Icon name="lucide:phone" size="14" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
