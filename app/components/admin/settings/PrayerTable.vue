<script setup lang="ts">
interface Row { key: string, label: string, ar: string, time: string, noIq?: boolean }

const props = defineProps<{
  rows: Row[]
  adj: Record<string, number>
  iq: Record<string, number>
}>()
const emit = defineEmits<{
  'update:adj': [v: Record<string, number>]
  'update:iq':  [v: Record<string, number>]
}>()

const setAdj = (key: string, v: number) => emit('update:adj', { ...props.adj, [key]: v })
const setIq  = (key: string, v: number) => emit('update:iq',  { ...props.iq,  [key]: v })
</script>

<template>
  <table class="w-full border-separate border-spacing-0">
    <thead>
      <tr>
        <th class="text-left px-3.5 py-3 text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border rounded-tl-cms w-[26%]">Sholat</th>
        <th class="text-left px-3.5 py-3 text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Waktu Adzan</th>
        <th class="text-left px-3.5 py-3 text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Penyesuaian</th>
        <th class="text-left px-3.5 py-3 text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border">Jeda Iqamah</th>
        <th class="text-right px-3.5 py-3 text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border w-20 rounded-tr-cms">Aktif</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(p, i) in rows" :key="p.key" class="hover:bg-cms-green-50 transition-colors">
        <td :class="['px-3.5 py-3 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <div class="flex items-center gap-3">
            <div class="w-[34px] h-[34px] rounded-[9px] bg-cms-green-100 text-cms-green-700 grid place-items-center shrink-0">
              <Icon name="lucide:book-marked" size="16" />
            </div>
            <div>
              <div class="font-semibold text-[13.5px]">{{ p.label }}</div>
              <div class="font-serif text-[13px] text-cms-muted mt-px" dir="rtl">{{ p.ar }}</div>
            </div>
          </div>
        </td>
        <td :class="['px-3.5 py-3 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <span class="inline-block font-mono text-sm font-bold bg-cms-green-100 text-cms-green-800 px-2.5 py-1 rounded-lg tracking-[0.5px]">
            {{ p.time }}
          </span>
        </td>
        <td :class="['px-3.5 py-3 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <AdminSettingsStepper
            :model-value="adj[p.key] ?? 0"
            show-sign
            @update:model-value="setAdj(p.key, $event)"
          />
        </td>
        <td :class="['px-3.5 py-3 text-[13.5px] align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <span v-if="p.noIq" class="text-cms-muted text-[12px]">—</span>
          <AdminSettingsStepper
            v-else
            :model-value="iq[p.key] ?? 0"
            :min="0"
            @update:model-value="setIq(p.key, $event)"
          />
        </td>
        <td :class="['px-3.5 py-3 text-right align-middle', i < rows.length - 1 ? 'border-b border-cms-border' : '']">
          <AdminToggleSwitch :model-value="true" @update:model-value="() => {}" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
