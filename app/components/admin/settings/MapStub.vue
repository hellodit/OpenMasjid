<script setup lang="ts">
const props = defineProps<{
  title: string
  latitude?: number | null
  longitude?: number | null
  timezone: string
}>()

const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(4)}° ${v < 0 ? neg : pos}`
const description = computed(() => {
  const parts: string[] = []
  if (props.latitude != null && props.longitude != null) {
    parts.push(`${coord(props.latitude, 'LU', 'LS')}, ${coord(props.longitude, 'BT', 'BB')}`)
  }
  else {
    parts.push('Koordinat belum diatur')
  }
  parts.push(`zona waktu ${props.timezone}`)
  return parts.join(' · ')
})
const mapUrl = computed(() =>
  props.latitude != null && props.longitude != null
    ? `https://www.openstreetmap.org/?mlat=${props.latitude}&mlon=${props.longitude}#map=17/${props.latitude}/${props.longitude}`
    : null,
)
</script>

<template>
  <div class="cms-pattern-fade relative overflow-hidden mt-1.5 flex items-center gap-3.5 px-4 py-3.5 border border-cms-border rounded-cms bg-cms-green-50">
    <div class="relative z-[1] w-10 h-10 rounded-full bg-cms-green-700 text-white grid place-items-center shrink-0 shadow-[0_6px_14px_-6px_oklch(0.45_0.10_155_/_0.5)]">
      <Icon name="lucide:map-pin" size="18" />
    </div>
    <div class="relative z-[1] flex-1 min-w-0">
      <div class="font-semibold text-[13.5px] truncate">{{ title }}</div>
      <div class="text-[12px] text-cms-muted mt-0.5">{{ description }}</div>
    </div>
    <UButton
      v-if="mapUrl"
      :to="mapUrl"
      target="_blank"
      size="sm"
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-external-link"
      class="relative z-[1]"
    >
      Lihat di peta
    </UButton>
  </div>
</template>
