<script setup lang="ts">
import { PRAYER_KEYS, PRAYER_LABELS, type PrayerId, type PrayerTime } from '#shared/utils/prayer'

const props = defineProps<{ times?: PrayerTime[] | null, loading?: boolean }>()
const adjustments = defineModel<Record<PrayerId, number>>('adjustments', { required: true })
const iqamah = defineModel<Record<PrayerId, number>>('iqamah', { required: true })

const timeOf = computed(() => new Map((props.times ?? []).map(t => [t.id, t])))

const th = 'text-left px-3.5 py-3 text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold bg-cms-surface-2 border-b border-cms-border'
const td = (i: number) => ['px-3.5 py-3 text-[13.5px] align-middle', i < PRAYER_KEYS.length - 1 ? 'border-b border-cms-border' : '']
const stepperUi = { root: 'w-[132px]', base: 'font-mono text-[12.5px] font-semibold text-center' }
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-separate border-spacing-0 min-w-[620px]">
      <thead>
        <tr>
          <th :class="[th, 'rounded-tl-cms w-[26%]']">Sholat</th>
          <th :class="th">Adzan</th>
          <th :class="th">Penyesuaian</th>
          <th :class="th">Jeda Iqamah</th>
          <th :class="[th, 'rounded-tr-cms text-right']">Iqamah</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(id, i) in PRAYER_KEYS" :key="id" class="hover:bg-cms-green-50 transition-colors">
          <td :class="td(i)">
            <div class="flex items-center gap-3">
              <div class="w-[34px] h-[34px] rounded-[9px] bg-cms-green-100 text-cms-green-700 grid place-items-center shrink-0">
                <Icon :name="id === 'sunrise' ? 'lucide:sunrise' : 'lucide:book-marked'" size="16" />
              </div>
              <div>
                <div class="font-semibold text-[13.5px]">{{ PRAYER_LABELS[id].name }}</div>
                <div class="font-arab text-[14px] text-cms-muted mt-px" dir="rtl">{{ PRAYER_LABELS[id].ar }}</div>
              </div>
            </div>
          </td>
          <td :class="td(i)">
            <USkeleton v-if="loading && !timeOf.get(id)" class="h-7 w-16 rounded-lg" />
            <span
              v-else
              :class="['inline-block font-mono text-sm font-bold bg-cms-green-100 text-cms-green-800 px-2.5 py-1 rounded-lg tracking-[0.5px] transition-opacity', loading ? 'opacity-50' : '']"
            >
              {{ timeOf.get(id)?.time ?? '—' }}
            </span>
          </td>
          <td :class="td(i)">
            <UFormField :name="`prayerAdjustments.${id}`">
              <UInputNumber
                v-model="adjustments[id]"
                :min="-30"
                :max="30"
                :format-options="{ signDisplay: 'exceptZero' }"
                size="sm"
                :ui="stepperUi"
                :aria-label="`Penyesuaian ${PRAYER_LABELS[id].name} (menit)`"
              />
            </UFormField>
          </td>
          <td :class="td(i)">
            <span v-if="id === 'sunrise'" class="text-cms-muted text-[12px]">—</span>
            <UFormField v-else :name="`iqamahOffsets.${id}`">
              <UInputNumber
                v-model="iqamah[id]"
                :min="0"
                :max="60"
                size="sm"
                :ui="stepperUi"
                :aria-label="`Jeda iqamah ${PRAYER_LABELS[id].name} (menit)`"
              />
            </UFormField>
          </td>
          <td :class="[td(i), 'text-right font-mono text-[13px] text-cms-ink-2']">
            {{ id === 'sunrise' ? '—' : (timeOf.get(id)?.iq ?? '—') }}
          </td>
        </tr>
      </tbody>
    </table>
    <p class="text-[11.5px] text-cms-muted mt-2.5">
      Penyesuaian & jeda dalam menit. Penyesuaian ditambahkan ke waktu adzan hasil perhitungan.
    </p>
  </div>
</template>
