<script setup lang="ts">
import { REGISTRANT_STATUS_LABELS, type RegistrantStatus } from '#shared/utils/events'
import { formatDate, formatTimeRange } from '~/utils/format'

const props = withDefaults(defineProps<{
  /** Opaque signed ticket code (`om1.<id>.<sig>`), encoded as the QR payload. */
  code: string
  title: string
  startDate: string
  endDate?: string | null
  startTime?: string | null
  endTime?: string | null
  attendeeName?: string | null
  status: RegistrantStatus
  /** Larger QR for fullscreen scanning. */
  large?: boolean
}>(), { endDate: null, startTime: null, endTime: null, attendeeName: null, large: false })

const qr = ref<string | null>(null)
const failed = ref(false)

async function render() {
  if (!import.meta.client) return
  try {
    const QRCode = (await import('qrcode')).default
    qr.value = await QRCode.toDataURL(props.code, { margin: 1, width: props.large ? 520 : 280, errorCorrectionLevel: 'M' })
    failed.value = false
  }
  catch {
    failed.value = true
  }
}

onMounted(render)
watch(() => [props.code, props.large], render)

const dateLabel = computed(() => {
  const d = props.endDate && props.endDate !== props.startDate
    ? `${formatDate(props.startDate)} – ${formatDate(props.endDate)}`
    : formatDate(props.startDate)
  const t = formatTimeRange(props.startTime, props.endTime)
  return t ? `${d} · ${t}` : d
})

const badgeColor = computed(() => ({ confirmed: 'primary', attended: 'info', cancelled: 'neutral' } as const)[props.status])
</script>

<template>
  <div class="rounded-cms-lg border border-cms-border bg-white overflow-hidden">
    <div class="px-4 pt-4 pb-3 border-b border-dashed border-cms-border-strong">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[10.5px] uppercase tracking-[1.2px] text-cms-gold-ink font-semibold">
            Tiket kegiatan
          </div>
          <div class="font-serif text-[16px] font-semibold leading-tight mt-0.5">
            {{ title }}
          </div>
          <div class="text-[12px] text-cms-muted mt-1">
            {{ dateLabel }}
          </div>
        </div>
        <UBadge :color="badgeColor" variant="subtle" size="sm" class="shrink-0 rounded-full uppercase tracking-[0.3px] font-semibold">
          {{ REGISTRANT_STATUS_LABELS[status] }}
        </UBadge>
      </div>
    </div>

    <div class="px-4 py-4 flex flex-col items-center">
      <div
        class="rounded-cms bg-white border border-cms-border p-2 grid place-items-center"
        :class="large ? 'w-[min(78vw,340px)] aspect-square' : 'w-[200px] h-[200px]'"
      >
        <img
          v-if="qr"
          :src="qr"
          alt="Kode QR tiket"
          class="w-full h-full [image-rendering:pixelated]"
          :class="status === 'cancelled' ? 'opacity-30' : ''"
        >
        <div v-else-if="failed" class="text-[12px] text-cms-muted text-center px-3">
          Kode QR gagal dibuat. Tunjukkan kode di bawah ke panitia.
        </div>
        <USkeleton v-else class="w-full h-full" />
      </div>

      <div v-if="attendeeName" class="mt-3 text-[13.5px] font-semibold text-cms-ink">
        {{ attendeeName }}
      </div>
      <div class="mt-1.5 font-mono text-[10.5px] leading-snug text-cms-muted break-all text-center max-w-[300px] select-all">
        {{ code }}
      </div>
      <div class="mt-2 text-[11.5px] text-cms-muted-2 text-center">
        Tunjukkan kode QR ini ke panitia saat tiba di lokasi.
      </div>
    </div>
  </div>
</template>
