<script setup lang="ts">
import { firstOfMonthIso, formatDate, formatRupiah, todayIso } from '~/utils/format'
import type { TabsItem } from '@nuxt/ui'
import { useCashbookSummary } from '~/composables/useCashbook'
const api = useApiBase()

definePageMeta({ layout: 'admin' })
useHead({ title: 'Laporan — Buku Kas' })

const range = ref({ from: firstOfMonthIso(new Date()), to: todayIso() })
const breakdownType = ref<'income' | 'expense'>('expense')

const breakdownTabs = [
  { label: 'Pengeluaran', value: 'expense' },
  { label: 'Pemasukan', value: 'income' },
] satisfies TabsItem[]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

type Preset = 'this-month' | 'last-month' | 'this-year' | 'last-year'
const presets: Array<{ key: Preset; label: string }> = [
  { key: 'this-month', label: 'Bulan ini' },
  { key: 'last-month', label: 'Bulan lalu' },
  { key: 'this-year', label: 'Tahun ini' },
  { key: 'last-year', label: 'Tahun lalu' },
]

function presetRange(preset: Preset): { from: string; to: string } {
  const now = new Date()
  const y = now.getFullYear()
  if (preset === 'this-month') return { from: firstOfMonthIso(now), to: todayIso() }
  if (preset === 'last-month') {
    const prev = new Date(y, now.getMonth() - 1, 1)
    const lastDay = new Date(y, now.getMonth(), 0).getDate()
    const ym = `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}`
    return { from: `${ym}-01`, to: `${ym}-${pad(lastDay)}` }
  }
  if (preset === 'this-year') return { from: `${y}-01-01`, to: todayIso() }
  return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` }
}

const activePreset = computed(() =>
  presets.find((p) => {
    const r = presetRange(p.key)
    return r.from === range.value.from && r.to === range.value.to
  })?.key,
)

const summaryQuery = computed(() => ({ from: range.value.from, to: range.value.to }))
const breakdownQuery = computed(() => ({ ...summaryQuery.value, type: breakdownType.value }))

const [{ data: summary }, { data: breakdown, pending: breakdownLoading }] = await Promise.all([
  useCashbookSummary(summaryQuery),
  useFetch(`${api}/admin/cashbook/reports/by-category`, { query: breakdownQuery, watch: [breakdownQuery] }),
])

const rangeLabel = computed(() =>
  summary.value ? `${formatDate(summary.value.range.from)} – ${formatDate(summary.value.range.to)}` : '',
)

function exportCsv() {
  // Cookie-authenticated GET; the server sets Content-Disposition: attachment.
  const params = new URLSearchParams({ from: range.value.from, to: range.value.to })
  window.location.href = `${api}/admin/cashbook/reports/export?${params}`
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Laporan Keuangan"
      description="Ringkasan pemasukan, pengeluaran, dan breakdown per kategori untuk periode tertentu."
    >
      <template #actions>
        <UButton color="neutral" variant="ghost" icon="i-lucide-download" label="Export CSV" @click="exportCsv" />
      </template>
    </AdminPageHeader>

    <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-4 mb-6 flex flex-wrap items-end gap-4">
      <div>
        <div class="text-[11px] uppercase tracking-[0.3px] text-cms-muted font-semibold mb-1">Periode</div>
        <div class="flex items-center gap-2">
          <UInput v-model="range.from" type="date" aria-label="Dari tanggal" :max="range.to" />
          <span class="text-cms-muted">—</span>
          <UInput v-model="range.to" type="date" aria-label="Sampai tanggal" :min="range.from" />
        </div>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <UButton
          v-for="p in presets"
          :key="p.key"
          size="sm"
          :color="activePreset === p.key ? 'primary' : 'neutral'"
          :variant="activePreset === p.key ? 'soft' : 'ghost'"
          :label="p.label"
          @click="range = presetRange(p.key)"
        />
      </div>
      <div v-if="rangeLabel" class="ml-auto text-[12.5px] text-cms-muted">{{ rangeLabel }}</div>
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
        :delta="summary?.totals?.transferCount ? `${summary.totals.transferCount} transfer antar akun` : undefined"
        icon="lucide:trending-up"
        tone="info"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <div class="flex items-center justify-between mb-3 gap-3">
          <h3 class="font-serif text-[18px] font-semibold m-0">Breakdown per Kategori</h3>
          <UTabs
            v-model="breakdownType"
            :items="breakdownTabs"
            :content="false"
            color="neutral"
            variant="pill"
            size="xs"
          />
        </div>
        <AdminCashbookCategoryBreakdown
          :items="(breakdown?.breakdown ?? []).map((b) => ({ ...b, type: breakdownType }))"
          :class="breakdownLoading && 'opacity-60'"
          empty-message="Belum ada transaksi pada periode ini."
        />
      </div>

      <div>
        <AdminCashbookBalanceSummary
          :total-balance="summary?.totalBalance ?? '0'"
          :accounts="summary?.accounts ?? []"
        />
      </div>
    </div>
  </div>
</template>
