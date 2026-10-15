<script setup lang="ts">
import { formatRupiah } from '~/utils/format'
const api = useApiBase()
const tp = useTenantPath()

definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard — OpenMasjid CMS' })

const { user } = useAuth()

const [{ data, error }, { data: prayer }, { data: mosque }, { data: cash }] = await Promise.all([
  useFetch(`${api}/admin/dashboard`),
  useFetch(`${api}/public/prayer-times`),
  useFetch(`${api}/public/mosque`),
  useFetch(`${api}/admin/cashbook/reports/summary`, { query: { period: 'month' } }),
])

const errorMessage = computed(() => (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage ?? error.value?.message)

const stats = computed(() => data.value?.stats ?? { activeEvents: 0, registered: 0, attended: 0, attendanceRate: 0 })
const todayEvents = computed(() => data.value?.todayEvents ?? [])
const upcomingEvents = computed(() => (data.value?.upcomingEvents ?? []).filter(e => !todayEvents.value.some(t => t.id === e.id)))
const weekTotal = computed(() => (data.value?.registrationsLast7Days ?? []).reduce((s, d) => s + d.count, 0))
const categoryTotal = computed(() => (data.value?.eventsPerCategory ?? []).reduce((s, c) => s + c.n, 0))

const num = (n: number) => n.toLocaleString('id-ID')

const heroDate = computed(() => {
  const iso = data.value?.today ?? prayer.value?.date
  if (!iso) return ''
  const p = dateParts(iso)
  return `${p.day}, ${p.d} ${p.m}`
})

// Highlight the prayer whose time has started most recently (sunrise excluded).
const prayers = computed(() => {
  const list = (prayer.value?.prayers ?? []).filter(p => p.id !== 'sunrise')
  const now = Date.now()
  let current = -1
  list.forEach((p, i) => {
    if (new Date(p.at).getTime() <= now) current = i
  })
  return list.map((p, i) => ({ name: p.name, time: p.time, now: i === current }))
})

const description = computed(() => {
  const n = todayEvents.value.length
  const where = mosque.value?.name ? ` di ${mosque.value.name}` : ''
  const head = n ? `Hari ini ada ${n} kegiatan terjadwal${where}.` : `Tidak ada kegiatan terjadwal hari ini${where}.`
  return `${head} ${num(weekTotal.value)} jamaah mendaftar dalam 7 hari terakhir.`
})
</script>

<template>
  <div>
    <AdminDashboardHero
      :name="user?.name || 'Pengurus'"
      :description="description"
      arabic="بَارَكَ اللَّهُ فِيْكُمْ"
      :date="heroDate"
      :hijri="prayer?.hijri"
      :prayers="prayers"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Gagal memuat data dashboard"
      :description="errorMessage"
      class="mb-6"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard label="Kegiatan Aktif" :num="num(stats.activeEvents)" icon="lucide:calendar" />
      <AdminStatCard label="Jamaah Terdaftar" :num="num(stats.registered)" :delta="weekTotal ? `${num(weekTotal)} dalam 7 hari` : undefined" tone="info" icon="lucide:users" />
      <AdminStatCard label="Jamaah Hadir" :num="num(stats.attended)" tone="gold" icon="lucide:user-check" />
      <AdminStatCard label="Tingkat Kehadiran" :num="`${stats.attendanceRate}%`" tone="rose" icon="lucide:trending-up" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[18px]">
      <div class="space-y-4">
        <AdminPanel
          title="Kegiatan Hari Ini"
          subtitle="Kegiatan tayang yang berlangsung hari ini."
        >
          <template #head>
            <AdminBtn size="sm" :to="tp('/admin/events')">Lihat semua →</AdminBtn>
          </template>
          <div v-if="todayEvents.length" class="flex flex-col gap-2.5">
            <AdminDashboardTodayItem v-for="ev in todayEvents" :key="ev.id" :ev="ev" />
          </div>
          <div v-else class="text-[13px] text-cms-muted py-4 text-center">
            Tidak ada kegiatan hari ini.
          </div>
        </AdminPanel>

        <AdminPanel
          title="Kegiatan Mendatang"
          subtitle="Kegiatan tayang berikutnya."
        >
          <template #head>
            <AdminBtn size="sm" :to="tp('/admin/events?status=upcoming')">Lihat semua →</AdminBtn>
          </template>
          <div v-if="upcomingEvents.length" class="flex flex-col gap-2.5">
            <AdminDashboardTodayItem v-for="ev in upcomingEvents" :key="ev.id" :ev="ev" show-date />
          </div>
          <div v-else class="text-[13px] text-cms-muted py-4 text-center">
            Belum ada kegiatan mendatang.
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
                Total {{ num(weekTotal) }}
              </span>
            </div>
          </template>
          <AdminDashboardWeeklyBarChart :series="data?.registrationsLast7Days ?? []" />
        </AdminPanel>
      </div>

      <div class="space-y-4">
        <AdminPanel title="Distribusi Kategori" :subtitle="`${num(categoryTotal)} kegiatan total`">
          <AdminDashboardCategoryDonut :items="data?.eventsPerCategory ?? []" />
        </AdminPanel>

        <AdminPanel v-if="cash" title="Kas Masjid" subtitle="Ringkasan bulan ini">
          <template #head>
            <AdminBtn size="sm" :to="tp('/admin/cashbook')">Buka →</AdminBtn>
          </template>
          <div class="bg-cms-surface-2 border border-cms-border rounded-cms px-4 py-3.5 mb-2.5">
            <div class="text-[11px] text-cms-muted uppercase tracking-[0.4px] font-semibold">Total Saldo</div>
            <div class="font-serif text-[24px] font-bold text-cms-green-700 mt-0.5">{{ formatRupiah(cash.totalBalance) }}</div>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="bg-cms-surface-2 border border-cms-border rounded-cms px-3.5 py-3">
              <div class="text-[11px] text-cms-muted uppercase tracking-[0.4px] font-semibold flex items-center gap-1">
                <Icon name="lucide:arrow-down-left" size="12" class="text-cms-green-700" /> Pemasukan
              </div>
              <div class="font-semibold text-[14px] mt-1 text-cms-green-700">{{ formatRupiah(cash.totals.income) }}</div>
              <div class="text-[11px] text-cms-muted">{{ cash.totals.incomeCount }} transaksi</div>
            </div>
            <div class="bg-cms-surface-2 border border-cms-border rounded-cms px-3.5 py-3">
              <div class="text-[11px] text-cms-muted uppercase tracking-[0.4px] font-semibold flex items-center gap-1">
                <Icon name="lucide:arrow-up-right" size="12" class="text-cms-rose" /> Pengeluaran
              </div>
              <div class="font-semibold text-[14px] mt-1 text-cms-rose">{{ formatRupiah(cash.totals.expense) }}</div>
              <div class="text-[11px] text-cms-muted">{{ cash.totals.expenseCount }} transaksi</div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Pendaftaran Terkini" subtitle="Aktivitas jamaah terbaru">
          <template #head>
            <AdminBtn size="sm" :to="tp('/admin/registrants')">Semua →</AdminBtn>
          </template>
          <AdminDashboardActivityFeed :items="data?.recentRegistrations ?? []" />
        </AdminPanel>
      </div>
    </div>
  </div>
</template>
