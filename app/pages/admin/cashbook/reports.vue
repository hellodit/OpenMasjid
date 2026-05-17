<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthSession } from '~/composables/useAuthSession'
import { useCashbookSummary } from '~/composables/useCashbook'
import { firstOfMonthIso, formatRupiah, todayIso } from '~/utils/format'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Laporan — Buku Kas' })

const today = new Date()
const range = ref({ from: firstOfMonthIso(today), to: todayIso() })
const breakdownType = ref<'income' | 'expense'>('expense')

const summaryQuery = computed(() => ({ from: range.value.from, to: range.value.to }))
const { authHeaders } = useAuthSession()
const { data: summary } = useCashbookSummary(summaryQuery)

interface BreakdownResponse {
  range: { from: string; to: string }
  type: 'income' | 'expense'
  grandTotal: string
  breakdown: Array<{
    categoryId: string | null
    categoryName: string | null
    colorToken: string | null
    icon: string | null
    total: string
    count: number
    percentage: string
  }>
}

const breakdownQuery = computed(() => ({
  type: breakdownType.value,
  from: range.value.from,
  to: range.value.to,
}))

const { data: breakdown } = useFetch<BreakdownResponse>(
  '/api/admin/cashbook/reports/by-category',
  { query: breakdownQuery, headers: authHeaders(), watch: [breakdownQuery] },
)

async function exportCsv() {
  const params = new URLSearchParams({ from: range.value.from, to: range.value.to })
  const res = await fetch(`/api/admin/cashbook/reports/export?${params}`, {
    headers: authHeaders(),
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `laporan-${range.value.from}_${range.value.to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const inputCls =
  'h-9 px-2.5 border border-cms-border rounded-cms bg-cms-surface text-sm text-cms-ink outline-none focus:border-cms-green-700'
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Laporan Keuangan"
      description="Ringkasan pemasukan, pengeluaran, dan breakdown per kategori untuk periode tertentu."
    >
      <template #actions>
        <AdminBtn variant="ghost" @click="exportCsv">
          <Icon name="lucide:download" size="16" /> Export CSV
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-4 mb-6 flex flex-wrap items-end gap-3">
      <div>
        <div class="text-[11px] uppercase tracking-[0.3px] text-cms-muted font-semibold mb-1">Periode</div>
        <div class="flex items-center gap-2">
          <input v-model="range.from" type="date" :class="inputCls">
          <span class="text-cms-muted">—</span>
          <input v-model="range.to" type="date" :class="inputCls">
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <AdminStatCard
        label="Total Pemasukan"
        :num="formatRupiah(summary?.totals?.income ?? '0')"
        :delta="`${summary?.totals?.incomeCount ?? 0} transaksi`"
        icon="lucide:arrow-down-circle"
        tone="default"
      />
      <AdminStatCard
        label="Total Pengeluaran"
        :num="formatRupiah(summary?.totals?.expense ?? '0')"
        :delta="`${summary?.totals?.expenseCount ?? 0} transaksi`"
        icon="lucide:arrow-up-circle"
        tone="rose"
      />
      <AdminStatCard
        label="Arus Kas Bersih"
        :num="formatRupiah(summary?.totals?.netCashFlow ?? '0')"
        icon="lucide:trending-up"
        tone="info"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-serif text-[18px] font-semibold m-0">Breakdown per Kategori</h3>
          <div class="inline-flex gap-1 p-1 bg-cms-surface-2 rounded-cms border border-cms-border">
            <button
              type="button"
              :class="[
                'h-7 px-3 rounded-cms-sm text-[12.5px] font-semibold',
                breakdownType === 'expense' ? 'bg-cms-surface text-cms-ink shadow-sm' : 'text-cms-muted',
              ]"
              @click="breakdownType = 'expense'"
            >Pengeluaran</button>
            <button
              type="button"
              :class="[
                'h-7 px-3 rounded-cms-sm text-[12.5px] font-semibold',
                breakdownType === 'income' ? 'bg-cms-surface text-cms-ink shadow-sm' : 'text-cms-muted',
              ]"
              @click="breakdownType = 'income'"
            >Pemasukan</button>
          </div>
        </div>
        <CashbookCategoryBreakdown
          :items="breakdown?.breakdown ?? []"
          empty-message="Belum ada transaksi pada periode ini."
        />
      </div>

      <div>
        <CashbookBalanceSummary
          :total-balance="summary?.totalBalance ?? '0'"
          :accounts="summary?.accounts ?? []"
        />
      </div>
    </div>
  </div>
</template>
