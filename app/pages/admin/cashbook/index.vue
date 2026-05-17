<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  useCashAccounts,
  useCashbookSummary,
  useTransactions,
} from '~/composables/useCashbook'
import { formatRupiah, todayIso, firstOfMonthIso } from '~/utils/format'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Buku Kas — OpenMasjid CMS' })

const today = new Date()
const period = ref({ from: firstOfMonthIso(today), to: todayIso() })
const summaryQuery = computed(() => ({ from: period.value.from, to: period.value.to }))

const { data: summary, pending: summaryLoading } = useCashbookSummary(summaryQuery)
const { data: accountsData } = useCashAccounts()

const recentFilters = ref({ pageSize: 10, page: 1 })
const { data: recentData, pending: recentLoading } = useTransactions(recentFilters)

const router = useRouter()
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas Masjid"
      title="Ringkasan Keuangan"
      description="Pencatatan pemasukan, pengeluaran, dan saldo kas masjid. Data dapat dishare ke jamaah lewat halaman transparansi."
    >
      <template #actions>
        <AdminBtn :to="`/admin/cashbook/reports`" variant="ghost">
          <Icon name="lucide:bar-chart-3" size="16" /> Laporan
        </AdminBtn>
        <AdminBtn to="/admin/cashbook/transactions/new" variant="primary">
          <Icon name="lucide:plus" size="16" /> Transaksi Baru
        </AdminBtn>
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
        tone="gold"
        icon="lucide:arrow-down-circle"
      />
      <AdminStatCard
        label="Pengeluaran (bulan ini)"
        :num="formatRupiah(summary?.totals?.expense ?? '0')"
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
          <CashbookTransactionTable
            :rows="recentData?.data ?? []"
            :loading="recentLoading"
            empty-message="Belum ada transaksi. Mulai dengan mencatat infaq atau donasi pertama."
            @open="(id: string) => router.push(`/admin/cashbook/transactions/${id}`)"
          />
        </AdminPanel>
      </div>

      <div class="lg:col-span-1">
        <CashbookBalanceSummary
          :total-balance="summary?.totalBalance ?? '0'"
          :accounts="accountsData ?? []"
        />
        <div class="mt-4">
          <AdminPanel title="Aksi Cepat">
            <div class="flex flex-col gap-2">
              <AdminBtn to="/admin/cashbook/transactions/new?type=income">
                <Icon name="lucide:arrow-down-circle" size="16" /> Catat Pemasukan
              </AdminBtn>
              <AdminBtn to="/admin/cashbook/transactions/new?type=expense">
                <Icon name="lucide:arrow-up-circle" size="16" /> Catat Pengeluaran
              </AdminBtn>
              <AdminBtn to="/admin/cashbook/transactions/new?type=transfer">
                <Icon name="lucide:repeat" size="16" /> Transfer antar Akun
              </AdminBtn>
              <AdminBtn to="/admin/cashbook/accounts" variant="ghost">
                <Icon name="lucide:landmark" size="16" /> Kelola Akun
              </AdminBtn>
              <AdminBtn to="/admin/cashbook/categories" variant="ghost">
                <Icon name="lucide:tags" size="16" /> Kelola Kategori
              </AdminBtn>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  </div>
</template>
