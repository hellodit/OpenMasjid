<script setup lang="ts">
import QRCode from 'qrcode'

const requestUrl = useRequestURL()
const homeUrl = `${requestUrl.origin}/`
const qrDataUrl = ref('')

onMounted(async () => {
  qrDataUrl.value = await QRCode.toDataURL(homeUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    color: { dark: '#0a1f15', light: '#ffffff' },
    width: 720,
  })
})
</script>

<template>
  <div class="relative z-10">
    <div
      class="flex items-center text-gold-2 uppercase"
      style="gap: 1.04vw; margin-bottom: 1.15vw; font-size: 0.68vw; letter-spacing: 0.26vw;"
    >
      Halaman Masjid Online
      <span
        class="flex-1 h-px"
        style="background: linear-gradient(90deg, oklch(0.32 0.05 155), transparent);"
      />
    </div>

    <div
      class="grid items-center border border-line"
      style="grid-template-columns: auto 1fr; gap: 2.5vw; border-radius: 0.94vw; padding: 1.5vw 2vw; background: oklch(0.16 0.04 155 / 0.6);"
    >
      <div
        class="rounded-md bg-white grid place-items-center shrink-0 overflow-hidden"
        style="width: 11vw; height: 11vw; padding: 0.5vw;"
      >
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QR halaman utama masjid"
          style="width: 100%; height: 100%; image-rendering: pixelated;"
        >
      </div>

      <div class="leading-tight">
        <div
          class="uppercase text-muted"
          style="font-size: 0.7vw; letter-spacing: 0.18vw;"
        >
          Pindai dengan kamera
        </div>
        <div
          class="font-serif font-semibold text-gold"
          style="font-size: 2vw; margin-top: 0.6vw; line-height: 1.1;"
        >
          Halaman Utama Masjid
        </div>
        <div
          class="text-ink-2"
          style="font-size: 1.05vw; margin-top: 0.9vw; line-height: 1.55; max-width: 30vw;"
        >
          Lihat profil masjid, jadwal sholat, dan agenda kegiatan langsung di gawai Anda.
        </div>
        <div
          class="font-mono text-gold-2 truncate"
          style="font-size: 0.95vw; margin-top: 1.05vw; max-width: 30vw;"
        >
          {{ homeUrl }}
        </div>
      </div>
    </div>
  </div>
</template>
