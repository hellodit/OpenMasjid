<script setup lang="ts">
import { formatDate, formatRupiah } from '~/utils/format'

interface Props {
  totalBalance: string
  totalIncome: string
  totalExpense: string
  range: { from: string, to: string }
}
const props = defineProps<Props>()

const stats = computed(() => [
  { label: 'Pemasukan', value: formatRupiah(props.totalIncome), tone: 'text-tv-ink' },
  { label: 'Pengeluaran', value: formatRupiah(props.totalExpense), tone: 'text-tv-ink-2' },
])
</script>

<template>
  <div class="relative z-10">
    <div
      class="flex items-center text-tv-gold-2 uppercase"
      style="gap: 1.04vw; margin-bottom: 1.15vw; font-size: 0.68vw; letter-spacing: 0.26vw;"
    >
      Transparansi Kas Masjid
      <span
        class="flex-1 h-px"
        style="background: linear-gradient(90deg, oklch(0.32 0.05 155), transparent);"
      />
    </div>

    <div
      class="grid items-center border border-tv-line"
      style="grid-template-columns: 1.2fr 1fr 1fr; gap: 2.5vw; border-radius: 0.94vw; padding: 1.8vw 2.2vw; background: oklch(0.16 0.04 155 / 0.6);"
    >
      <div class="leading-tight">
        <div class="uppercase text-tv-muted" style="font-size: 0.7vw; letter-spacing: 0.18vw;">
          Saldo Kas
        </div>
        <div class="font-serif font-semibold text-tv-gold" style="font-size: 2.6vw; margin-top: 0.6vw;">
          {{ formatRupiah(totalBalance) }}
        </div>
        <div class="text-tv-muted" style="font-size: 0.8vw; margin-top: 0.6vw;">
          Periode {{ formatDate(range.from) }} – {{ formatDate(range.to) }}
        </div>
      </div>

      <div
        v-for="s in stats"
        :key="s.label"
        class="leading-tight border-l border-tv-line"
        style="padding-left: 2vw;"
      >
        <div class="uppercase text-tv-muted" style="font-size: 0.7vw; letter-spacing: 0.18vw;">
          {{ s.label }} bulan ini
        </div>
        <div class="font-mono font-medium" :class="s.tone" style="font-size: 1.9vw; margin-top: 0.6vw;">
          {{ s.value }}
        </div>
      </div>
    </div>
  </div>
</template>
