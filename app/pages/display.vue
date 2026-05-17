<script setup lang="ts">
import KhatamBackground from '~/components/display/KhatamBackground.vue'
import TopBar from '~/components/display/TopBar.vue'
import ClockBlock from '~/components/display/ClockBlock.vue'
import NextPrayerCard from '~/components/display/NextPrayerCard.vue'
import PrayerSlider from '~/components/display/PrayerSlider.vue'
import AnnouncementMarquee from '~/components/display/AnnouncementMarquee.vue'
import MasjidInfo from '~/components/display/MasjidInfo.vue'

useHead({
  title: 'OpenMasjid — TV Display',
  htmlAttrs: { lang: 'id' },
  bodyAttrs: { class: 'overflow-hidden bg-bg text-ink font-sans' },
})

const { now, timeFull, timeHHMM, timeSec, gregorianDate, hijriDate } = useDisplayClock()
const { prayers, next, countdown } = usePrayerSchedule(now)

const masjid = {
  name: 'Masjid Al-Hikmah',
  address: "Jl. KH. Hasyim Asy'ari · Sukamaju",
}

const announcements = [
  { prefix: 'Selasa, 19 Mei.', body: "Kajian Tafsir Al-Mulk bersama Ust. Ahmad Mahfudz, Lc. — Ba'da Maghrib di Ruang Utama." },
  { prefix: 'Jumat, 22 Mei.', body: 'Khutbah Jumat oleh Ust. Faris Abdullah — Tema: Adab Mencari Ilmu.' },
  { prefix: 'Ahad, 24 Mei.', body: 'Penyaluran Zakat Maal Triwulan untuk 80 mustahik di Halaman Masjid, pukul 09:00.' },
  { prefix: 'Renovasi Atap Selatan', body: '— Sudah terkumpul Rp 32 jt dari target Rp 50 jt. Mari berinfaq melalui kotak amal.' },
  { prefix: 'Pendaftaran TPA Angkatan 14', body: 'dibuka untuk usia 5–12 tahun. Sekretariat masjid, jam kerja.' },
]

const infoItems = [
  { label: 'Suhu', value: '29°C' },
  { label: 'Kelembapan', value: '68%' },
  { label: 'Kiblat', value: '295° NW', gold: true },
]
</script>

<template>
  <div
    class="canvas-bg relative w-screen h-screen flex flex-col overflow-hidden"
    style="padding: 4.4vh 4.17vw; gap: 3.3vh;"
  >
    <KhatamBackground />

    <TopBar
      :name="masjid.name"
      :address="masjid.address"
      :time="timeFull"
    />

    <div
      class="relative z-10 grid items-center flex-shrink-0"
      style="grid-template-columns: 1.05fr 0.95fr; gap: 2.9vw;"
    >
      <ClockBlock
        :hhmm="timeHHMM"
        :seconds="timeSec"
        :gregorian-date="gregorianDate"
        :hijri-date="hijriDate"
      />

      <NextPrayerCard
        :name="next.name"
        :arabic="next.ar"
        :time="next.time"
        :countdown="countdown"
      />
    </div>

    <PrayerSlider :prayers="prayers" />

    <div
      class="relative z-10 grid items-center flex-shrink-0"
      style="grid-template-columns: 1fr auto; gap: 1.67vw;"
    >
      <AnnouncementMarquee :items="announcements" />
      <MasjidInfo :items="infoItems" />
    </div>
  </div>
</template>
