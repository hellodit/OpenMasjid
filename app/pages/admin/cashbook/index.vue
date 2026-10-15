<script setup lang="ts">
import {
  useCashAccounts,
  useCashbookSummary,
  useTransactions,
} from '~/composables/useCashbook'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Buku Kas — OpenMasjid CMS' })

const { isAdmin } = useAuth()
const summaryQuery = ref({ from: firstOfMonthIso(new Date()), to: todayIso() })
const recentFilters = ref({ pageSize: 10, page: 1 })

const [{ data: summary }, { data: accountsData }, { data: recentData, pending: recentLoading }] = await Promise.all([
  useCashbookSummary(summaryQuery),
  useCashAccounts(),
  useTransactions(recentFilters),
])

const router = useRouter()

const quickActions = [
  { to: '/admin/cashbook/transactions/new?type=income', icon: 'i-lucide-arrow-down-circle', label: 'Catat Pemasukan' },
  { to: '/admin/cashbook/transactions/new?type=expense', icon: 'i-lucide-arrow-up-circle', label: 'Catat Pengeluaran' },
  { to: '/admin/cashbook/transactions/new?type=transfer', icon: 'i-lucide-repeat', label: 'Transfer antar Akun' },
]
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas Masjid"
      title="Ringkasan Keuangan"
      description="Pencatatan pemasukan, pengeluaran, dan saldo kas masjid. Data dapat dishare ke jamaah lewat halaman transparansi."
    >
      <template #actions>
        <UButton to="/admin/cashbook/reports" color="neutral" variant="ghost" icon="i-lucide-bar-chart-3" label="Laporan" />
        <UButton
          v-if="isAdmin"
          to="/admin/cashbook/transactions/new"
          icon="i-lucide-plus"
          label="Transaksi Baru"
          class="font-semibold"
        />
      </template>
    </AdminPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminStatCard
        label="Saldo Total"
        :num="formatRupiah(summary?.totalBalance ?? '0')"
        tone="default"
        icon="lucide:wallet"
      />
      <AdminStatCard
        label="Pemasukan (bulan ini)"
        :num="formatRupiah(summary?.totals?.income ?? '0')"
        :delta="`${summary?.totals?.incomeCount ?? 0} transaksi`"
        tone="gold"
        icon="lucide:arrow-down-circle"
      />
      <AdminStatCard
        label="Pengeluaran (bulan ini)"
        :num="formatRupiah(summary?.totals?.expense ?? '0')"
        :delta="`${summary?.totals?.expenseCount ?? 0} transaksi`"
        tone="rose"
        icon="lucide:arrow-up-circle"
      />
      <AdminStatCard
        label="Arus Kas Bersih"
        :num="formatRupiah(summary?.totals?.netCashFlow ?? '0')"
        tone="info"
        icon="lucide:trending-up"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2">
        <AdminPanel title="Transaksi Terakhir">
          <template #head>
            <NuxtLink
              to="/admin/cashbook/transactions"
              class="text-[13px] font-semibold text-cms-green-700 hover:text-cms-green-800"
            >
              Lihat semua →
            </NuxtLink>
          </template>
          <AdminCashbookTransactionTable
            :rows="recentData?.data ?? []"
            :loading="recentLoading"
            empty-message="Belum ada transaksi. Mulai dengan mencatat infaq atau donasi pertama."
            @open="(id: string) => router.push(`/admin/cashbook/transactions/${id}`)"
          />
        </AdminPanel>
      </div>

      <div class="lg:col-span-1">
        <AdminCashbookBalanceSummary
          :total-balance="summary?.totalBalance ?? '0'"
          :accounts="accountsData ?? []"
        />
        <div class="mt-4">
          <AdminPanel :title="isAdmin ? 'Aksi Cepat' : 'Navigasi'">
            <div class="flex flex-col gap-2">
              <template v-if="isAdmin">
                <UButton
                  v-for="q in quickActions"
                  :key="q.to"
                  :to="q.to"
                  :icon="q.icon"
                  :label="q.label"
                  color="neutral"
                  variant="outline"
                  class="font-semibold"
                />
              </template>
              <UButton
                to="/admin/cashbook/accounts"
                color="neutral"
                variant="ghost"
                icon="i-lucide-landmark"
                label="Kelola Akun"
                class="font-semibold"
              />
              <UButton
                to="/admin/cashbook/categories"
                color="neutral"
                variant="ghost"
                icon="i-lucide-tags"
                label="Kelola Kategori"
                class="font-semibold"
              />
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  </div>
</template>
