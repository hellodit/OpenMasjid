<script setup lang="ts">
/** Today's prayer times for the chosen coordinates (Kemenag method, no corrections). */
const props = defineProps<{ latitude: number, longitude: number, timezone: string }>()

const ZERO = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }

const times = computed(() => {
  try {
    return computePrayerTimes(dateInTimeZone(props.timezone), {
      latitude: props.latitude,
      longitude: props.longitude,
      timezone: props.timezone,
      method: 'kemenag',
      madhab: 'shafi',
      adjustments: ZERO,
      iqamah: ZERO,
    })
  }
  catch {
    return []
  }
})

const tzLabel = computed(() => ({ 'Asia/Jakarta': 'WIB', 'Asia/Makassar': 'WITA', 'Asia/Jayapura': 'WIT' } as Record<string, string>)[props.timezone] ?? props.timezone)
</script>

<template>
  <div v-if="times.length" class="border border-cms-border rounded-cms bg-cms-surface-2 px-4 py-3.5">
    <div class="flex items-center justify-between gap-2 mb-2.5">
      <div class="text-[11px] uppercase tracking-[0.6px] font-semibold text-cms-muted flex items-center gap-1.5">
        <Icon name="lucide:clock" size="13" /> Pratinjau jadwal sholat hari ini
      </div>
      <span class="text-[11px] text-cms-muted">{{ tzLabel }}</span>
    </div>
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
      <div
        v-for="p in times"
        :key="p.id"
        class="bg-cms-surface border border-cms-border rounded-cms-sm px-2 py-2 text-center"
      >
        <div class="text-[11px] text-cms-muted">{{ p.name }}</div>
        <div class="font-semibold text-[15px] tabular-nums text-cms-green-700">{{ p.time }}</div>
      </div>
    </div>
    <p class="text-[11.5px] text-cms-muted m-0 mt-2">
      Dihitung dengan metode Kemenag RI. Metode, koreksi menit, dan iqamah dapat diatur di Pengaturan.
    </p>
  </div>
</template>
