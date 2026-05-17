<script setup lang="ts">
import { formatRupiah } from '~/utils/format'

interface Category {
  categoryName: string | null
  colorToken: string | null
  type: 'income' | 'expense' | 'transfer'
  total: string
}

defineProps<{
  totalBalance: string
  totalIncome: string
  totalExpense: string
  netCashFlow: string
  topCategories: Category[]
  range: { from: string; to: string }
}>()

function maxValue(items: Category[], type: 'income' | 'expense') {
  return Math.max(
    1,
    ...items.filter((c) => c.type === type).map((c) => Number(c.total)),
  )
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white border border-emerald-100 rounded-2xl shadow-sm p-8 text-center">
      <div class="text-emerald-700 text-[12px] uppercase tracking-[1.5px] font-semibold mb-1">
        Saldo Kas Masjid
      </div>
      <div class="font-serif text-[44px] sm:text-[56px] font-semibold text-emerald-800">
        {{ formatRupiah(totalBalance) }}
      </div>
      <div class="text-[12px] text-stone-500 mt-2">
        Periode laporan {{ range.from }} — {{ range.to }}
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white border border-stone-200 rounded-xl p-5">
        <div class="text-[12px] uppercase tracking-[0.4px] text-stone-500 font-semibold">Pemasukan</div>
        <div class="font-serif text-[26px] font-semibold mt-1 text-emerald-700">
          {{ formatRupiah(totalIncome) }}
        </div>
      </div>
      <div class="bg-white border border-stone-200 rounded-xl p-5">
        <div class="text-[12px] uppercase tracking-[0.4px] text-stone-500 font-semibold">Pengeluaran</div>
        <div class="font-serif text-[26px] font-semibold mt-1 text-rose-700">
          {{ formatRupiah(totalExpense) }}
        </div>
      </div>
      <div class="bg-white border border-stone-200 rounded-xl p-5">
        <div class="text-[12px] uppercase tracking-[0.4px] text-stone-500 font-semibold">Arus Kas Bersih</div>
        <div
          class="font-serif text-[26px] font-semibold mt-1"
          :class="Number(netCashFlow) >= 0 ? 'text-emerald-700' : 'text-rose-700'"
        >
          {{ Number(netCashFlow) >= 0 ? '+' : '' }}{{ formatRupiah(netCashFlow) }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white border border-stone-200 rounded-xl p-5">
        <div class="font-semibold mb-3 text-stone-800">Sumber Pemasukan</div>
        <div v-if="!topCategories.some((c) => c.type === 'income')" class="text-stone-400 text-sm py-4 text-center">
          Belum ada pemasukan tercatat.
        </div>
        <ul v-else class="flex flex-col gap-2.5">
          <li v-for="(c, i) in topCategories.filter((c) => c.type === 'income')" :key="`in-${i}`">
            <div class="flex justify-between items-center text-sm mb-1">
              <span class="text-stone-700">{{ c.categoryName ?? '—' }}</span>
              <span class="font-semibold text-stone-800">{{ formatRupiah(c.total) }}</span>
            </div>
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full"
                :style="{ width: `${(Number(c.total) / maxValue(topCategories, 'income')) * 100}%` }"
              />
            </div>
          </li>
        </ul>
      </div>

      <div class="bg-white border border-stone-200 rounded-xl p-5">
        <div class="font-semibold mb-3 text-stone-800">Alokasi Pengeluaran</div>
        <div v-if="!topCategories.some((c) => c.type === 'expense')" class="text-stone-400 text-sm py-4 text-center">
          Belum ada pengeluaran tercatat.
        </div>
        <ul v-else class="flex flex-col gap-2.5">
          <li v-for="(c, i) in topCategories.filter((c) => c.type === 'expense')" :key="`ex-${i}`">
            <div class="flex justify-between items-center text-sm mb-1">
              <span class="text-stone-700">{{ c.categoryName ?? '—' }}</span>
              <span class="font-semibold text-stone-800">{{ formatRupiah(c.total) }}</span>
            </div>
            <div class="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-rose-500 rounded-full"
                :style="{ width: `${(Number(c.total) / maxValue(topCategories, 'expense')) * 100}%` }"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
