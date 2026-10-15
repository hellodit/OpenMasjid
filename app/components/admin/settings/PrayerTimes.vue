<script setup lang="ts">
import type { MosqueSettingsInput } from '#shared/schemas/mosque'
import { PRAYER_CALC_METHODS, PRAYER_METHOD_LABELS, type PrayerTime } from '#shared/utils/prayer'

defineProps<{ times?: PrayerTime[] | null, loading?: boolean }>()
const state = defineModel<MosqueSettingsInput>('state', { required: true })

const methodItems = PRAYER_CALC_METHODS.map(m => ({ label: PRAYER_METHOD_LABELS[m], value: m }))
const madhabItems = [
  { label: 'Syafi\'i (bayangan = 1× tinggi)', value: 'shafi' as const },
  { label: 'Hanafi (bayangan = 2× tinggi)', value: 'hanafi' as const },
]
</script>

<template>
  <div>
    <AdminFormSection
      title="Jadwal Sholat"
      description="Waktu sholat dihitung otomatis dari koordinat masjid dengan metode berikut."
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <UFormField
          label="Metode Perhitungan"
          name="prayerMethod"
          help="Direkomendasikan: Kemenag RI untuk wilayah Indonesia."
        >
          <USelect
            v-model="state.prayerMethod"
            :items="methodItems"
            class="w-full"
            size="lg"
          />
        </UFormField>
        <UFormField label="Mazhab Ashar" name="asrMadhab">
          <USelect
            v-model="state.asrMadhab"
            :items="madhabItems"
            class="w-full"
            size="lg"
          />
        </UFormField>
      </div>
    </AdminFormSection>

    <AdminFormSection
      title="Penyesuaian Adzan & Iqamah"
      description="Koreksi menit waktu adzan dan jeda menuju iqamah untuk setiap sholat."
    >
      <AdminSettingsPrayerTable
        v-model:adjustments="state.prayerAdjustments"
        v-model:iqamah="state.iqamahOffsets"
        :times="times"
        :loading="loading"
      />
    </AdminFormSection>
  </div>
</template>
