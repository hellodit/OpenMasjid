<script setup lang="ts">
/**
 * Camera QR scanner built on the native BarcodeDetector API (no extra deps).
 * Emits `detect` with the raw code; the same code is debounced for 3 seconds.
 * The camera is released on unmount and while the page is hidden.
 */

/** Minimal typing — BarcodeDetector is not part of TypeScript's DOM lib yet. */
interface DetectedBarcode { rawValue: string }
interface BarcodeDetectorLike { detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]> }
interface BarcodeDetectorCtor {
  new (options?: { formats: string[] }): BarcodeDetectorLike
  getSupportedFormats?: () => Promise<string[]>
}

const props = defineProps<{ paused?: boolean }>()
const emit = defineEmits<{ detect: [code: string] }>()

const SCAN_INTERVAL_MS = 250
const SAME_CODE_DEBOUNCE_MS = 3000

type State = 'idle' | 'starting' | 'active' | 'unsupported' | 'denied' | 'error'
const state = ref<State>('idle')
const errorDetail = ref('')
const video = ref<HTMLVideoElement | null>(null)

let stream: MediaStream | null = null
let detector: BarcodeDetectorLike | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let detecting = false
let resumeOnVisible = false
let lastCode = ''
let lastAt = 0

function getDetectorCtor(): BarcodeDetectorCtor | undefined {
  return (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
}

async function start() {
  if (state.value === 'starting' || state.value === 'active') return
  const Ctor = getDetectorCtor()
  if (!Ctor || !navigator.mediaDevices?.getUserMedia) {
    state.value = 'unsupported'
    return
  }
  state.value = 'starting'
  try {
    const formats = await Ctor.getSupportedFormats?.()
    if (formats && !formats.includes('qr_code')) {
      state.value = 'unsupported'
      return
    }
    detector ??= new Ctor({ formats: ['qr_code'] })
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    const el = video.value
    if (!el) throw new Error('Video element missing')
    el.srcObject = stream
    await el.play()
    state.value = 'active'
    schedule()
  }
  catch (err) {
    stop()
    const name = (err as { name?: string }).name
    if (name === 'NotAllowedError' || name === 'SecurityError') state.value = 'denied'
    else {
      state.value = 'error'
      errorDetail.value = name === 'NotFoundError' || name === 'OverconstrainedError'
        ? 'Tidak ada kamera yang terdeteksi di perangkat ini.'
        : 'Kamera tidak dapat dinyalakan.'
    }
  }
}

function stop(nextState: State = 'idle') {
  clearTimeout(timer)
  timer = undefined
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  if (video.value) video.value.srcObject = null
  if (state.value === 'active' || state.value === 'starting') state.value = nextState
}

function schedule() {
  clearTimeout(timer)
  timer = setTimeout(tick, SCAN_INTERVAL_MS)
}

async function tick() {
  const el = video.value
  if (state.value !== 'active' || !detector || !el) return
  if (!props.paused && !detecting && el.readyState >= el.HAVE_CURRENT_DATA) {
    detecting = true
    try {
      const codes = await detector.detect(el)
      const code = codes.find(c => c.rawValue)?.rawValue?.trim()
      const now = Date.now()
      if (code && !(code === lastCode && now - lastAt < SAME_CODE_DEBOUNCE_MS)) {
        lastCode = code
        lastAt = now
        emit('detect', code)
      }
      else if (code && code === lastCode) {
        lastAt = now // keep debouncing while the same ticket stays in view
      }
    }
    catch {
      // Detection can fail on transient frames; keep scanning.
    }
    finally {
      detecting = false
    }
  }
  schedule()
}

function onVisibility() {
  if (document.hidden) {
    resumeOnVisible = state.value === 'active'
    stop()
  }
  else if (resumeOnVisible) {
    resumeOnVisible = false
    start()
  }
}

onMounted(() => {
  if (!getDetectorCtor() || !navigator.mediaDevices?.getUserMedia) state.value = 'unsupported'
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  stop()
})
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-5">
    <div class="flex items-center justify-between gap-3 mb-3">
      <h3 class="font-serif text-[17px] font-semibold m-0 flex items-center gap-2">
        <Icon name="lucide:camera" size="18" class="text-cms-green-700" />
        Pindai dengan Kamera
      </h3>
      <UButton
        v-if="state === 'active'"
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-lucide-camera-off"
        @click="stop()"
      >
        Matikan
      </UButton>
    </div>

    <div class="relative aspect-[4/3] rounded-cms overflow-hidden bg-cms-green-900">
      <video
        ref="video"
        muted
        playsinline
        :class="['absolute inset-0 w-full h-full object-cover', state === 'active' ? 'opacity-100' : 'opacity-0']"
      />

      <!-- Viewfinder -->
      <div v-if="state === 'active'" class="absolute inset-0 grid place-items-center pointer-events-none">
        <div class="w-[58%] aspect-square rounded-[18px] border-2 border-cms-gold shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]" />
        <div
          v-if="paused"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[12px] font-semibold bg-black/60 text-white px-3 py-1 rounded-full"
        >
          Memproses…
        </div>
      </div>

      <div
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-[oklch(0.92_0.02_155)]"
      >
        <template v-if="state === 'idle' || state === 'starting'">
          <Icon name="lucide:scan-line" size="40" class="text-cms-gold" />
          <p class="m-0 text-sm max-w-[280px]">
            Arahkan kamera ke kode QR pada e-tiket jamaah. Kehadiran dicatat otomatis.
          </p>
          <UButton color="secondary" icon="i-lucide-camera" :loading="state === 'starting'" @click="start">
            Nyalakan Kamera
          </UButton>
        </template>
        <template v-else>
          <Icon name="lucide:camera-off" size="36" class="text-cms-gold" />
          <p class="m-0 text-sm font-semibold">
            {{
              state === 'unsupported' ? 'Peramban ini belum mendukung pemindaian QR lewat kamera.'
              : state === 'denied' ? 'Izin kamera ditolak.'
                : errorDetail
            }}
          </p>
          <p class="m-0 text-[13px] opacity-80 max-w-[300px]">
            <template v-if="state === 'unsupported'">Gunakan Chrome/Edge di Android atau desktop, atau masukkan kode tiket secara manual di samping.</template>
            <template v-else-if="state === 'denied'">Izinkan akses kamera di pengaturan peramban, atau masukkan kode tiket secara manual.</template>
            <template v-else>Masukkan kode tiket secara manual, atau coba lagi.</template>
          </p>
          <UButton v-if="state !== 'unsupported'" color="secondary" variant="soft" icon="i-lucide-refresh-cw" @click="start">
            Coba Lagi
          </UButton>
        </template>
      </div>
    </div>
  </div>
</template>
