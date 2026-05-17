<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePublicCashbookSummary } from '~/composables/useCashbook'
import { formatDate } from '~/utils/format'

useHead({ title: 'Transparansi Keuangan — OpenMasjid' })

const period = ref<'month' | 'year'>('month')
const params = computed(() => ({ period: period.value }))
const { data: summary, pending } = usePublicCashbookSummary(params)

const shareUrl = ref('')
if (import.meta.client) shareUrl.value = window.location.href

async function copyLink() {
  if (!shareUrl.value) return
  await navigator.clipboard.writeText(shareUrl.value)
}
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <header class="bg-white border-b border-stone-200">
      <div class="max-w-5xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between gap-4">
        <div>
          <div class="text-emerald-700 text-[11px] uppercase tracking-[1.5px] font-semibold">
            Transparansi Keuangan
          </div>
          <h1 class="font-serif text-[24px] sm:text-[28px] font-semibold text-stone-800 mt-0.5 m-0">
            Buku Kas Masjid
          </h1>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-stone-200 bg-white text-sm font-semibold text-stone-700 hover:bg-stone-50"
          @click="copyLink"
        >
          <Icon name="lucide:link" size="14" /> Salin Tautan
        </button>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <div class="inline-flex gap-1 p-1 bg-white border border-stone-200 rounded-lg mb-6">
        <button
          v-for="p in [
            { v: 'month' as const, label: 'Bulan Ini' },
            { v: 'year' as const, label: 'Tahun Ini' },
          ]"
          :key="p.v"
          type="button"
          :class="[
            'h-9 px-4 rounded-md text-sm font-semibold',
            period === p.v ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-800',
          ]"
          @click="period = p.v"
        >
          {{ p.label }}
        </button>
      </div>

      <div v-if="pending" class="text-stone-400 text-center py-12">Memuat data…</div>

      <PublicCashbookSummary
        v-else-if="summary"
        :total-balance="summary.totalBalance"
        :total-income="summary.totalIncome"
        :total-expense="summary.totalExpense"
        :net-cash-flow="summary.netCashFlow"
        :top-categories="summary.topCategories"
        :range="summary.range"
      />

      <div class="mt-10 text-center text-stone-500 text-[12.5px]">
        <p>
          Laporan ini menampilkan ringkasan keuangan masjid untuk periode
          <span class="font-semibold text-stone-700">
            {{ summary ? `${formatDate(summary.range.from)} – ${formatDate(summary.range.to)}` : '—' }}
          </span>.
        </p>
        <p class="mt-1">
          Detail per transaksi hanya bisa diakses oleh pengurus DKM yang berwenang.
        </p>
      </div>
    </main>
  </div>
</template>
