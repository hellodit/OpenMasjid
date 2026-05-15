<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard — Masjidku CMS' })

const { EVENTS } = useAdminMock()
const today = computed(() => EVENTS.slice(0, 3))

const prayers = [
  { name: 'Subuh',   time: '04:32' },
  { name: 'Dzuhur',  time: '11:54' },
  { name: 'Ashar',   time: '15:18', now: true },
  { name: 'Maghrib', time: '17:51' },
  { name: 'Isya',    time: '19:04' },
]

const router = useRouter()
const openDetail = (id: string) => router.push(`/admin/kegiatan/${id}`)
</script>

<template>
  <div>
    <AdminDashboardHero
      name="H. Sulaiman"
      description="Hari ini ada 3 kegiatan terjadwal di Masjid Al-Hikmah. Total 142 jamaah telah mendaftar untuk pekan ini."
      arabic="بَارَكَ اللَّهُ فِيْكُمْ"
      date="Ahad, 17 Mei"
      :prayers="prayers"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard label="Kegiatan Aktif" :num="48" delta="6 minggu ini" icon="lucide:calendar" />
      <AdminStatCard label="Jamaah Terdaftar" num="1.284" delta="84 baru" tone="info" icon="lucide:users" />
      <AdminStatCard label="Donasi Bulan Ini" num="Rp 18,4 jt" delta="11% naik" tone="gold" icon="lucide:heart" />
      <AdminStatCard label="Tingkat Kehadiran" num="87%" delta="3 poin" tone="rose" icon="lucide:trending-up" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[18px]">
      <div class="space-y-4">
        <AdminPanel
          title="Kegiatan Hari Ini"
          subtitle="Jadwal yang berlangsung dalam 24 jam ke depan."
        >
          <template #head>
            <AdminBtn size="sm" to="/admin/kegiatan">Lihat semua →</AdminBtn>
          </template>
          <div class="flex flex-col gap-2.5">
            <div
              v-for="ev in today"
              :key="ev.id"
              @click="openDetail(ev.id)"
            >
              <AdminDashboardTodayItem :ev="ev" />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Pendaftar 7 Hari Terakhir"
          subtitle="Jumlah jamaah yang mendaftar pada kegiatan masjid."
        >
          <template #head>
            <div class="flex gap-2 items-center text-[12px] text-cms-muted">
              <span class="inline-flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-[3px] cms-bar-grad" />
                Pekan ini
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-[3px] cms-bar-grad-gold" />
                Pekan lalu
              </span>
            </div>
          </template>
          <AdminDashboardWeeklyBarChart />
        </AdminPanel>
      </div>

      <div class="space-y-4">
        <AdminPanel title="Distribusi Kategori" subtitle="48 kegiatan total bulan ini">
          <AdminDashboardCategoryDonut />
        </AdminPanel>

        <AdminPanel title="Aktivitas Terkini" subtitle="Riwayat operasional CMS">
          <AdminDashboardActivityFeed />
        </AdminPanel>

        <AdminPanel title="Donasi Aktif" subtitle="Pengumpulan dana terkini">
          <AdminDashboardDonationBar name="Renovasi Atap Selatan" amount="Rp 32 jt" :pct="64" caption="64% dari Rp 50 jt — 23 hari tersisa" />
          <AdminDashboardDonationBar name="Beasiswa Santri TPA" amount="Rp 12,8 jt" :pct="85" caption="85% dari Rp 15 jt — 8 hari tersisa" />
          <AdminDashboardDonationBar name="Iftar Ramadhan 1448 H" amount="Rp 4,2 jt" :pct="21" caption="21% dari Rp 20 jt — 156 hari tersisa" />
        </AdminPanel>
      </div>
    </div>
  </div>
</template>
