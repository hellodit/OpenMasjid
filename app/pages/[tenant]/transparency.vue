<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePublicCashbookSummary } from '~/composables/useCashbook'
import { formatDate } from '~/utils/format'
import PublicCashbookSummary from '~/components/display/PublicCashbookSummary.vue'
const api = useApiBase()
const tp = useTenantPath()

const { data: mosque } = useFetch(`${api}/public/mosque`, { key: 'public-mosque' })
const mosqueName = computed(() => mosque.value?.name ?? 'Masjid')

useHead({ title: () => `Transparansi Keuangan — ${mosque.value?.name ?? 'OpenMasjid'}` })

const periodItems = [
  { value: 'month' as const, label: 'Bulan Ini' },
  { value: 'year' as const, label: 'Tahun Ini' },
]
const toast = useToast()

const period = ref<'month' | 'year'>('month')
const params = computed(() => ({ period: period.value }))
const { data: summary, pending } = usePublicCashbookSummary(params)

const shareUrl = ref('')
if (import.meta.client) shareUrl.value = window.location.href

async function copyLink() {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    toast.add({ color: 'success', title: 'Tautan disalin' })
  }
  catch {
    toast.add({ color: 'error', title: 'Gagal menyalin tautan' })
  }
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
            Buku Kas {{ mosqueName }}
          </h1>
          <NuxtLink :to="tp('/')" class="text-[12.5px] text-stone-500 hover:text-emerald-700">
            ← Kembali ke halaman masjid
          </NuxtLink>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-link"
          @click="copyLink"
        >
          Salin Tautan
        </UButton>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <UTabs
        v-model="period"
        :items="periodItems"
        :content="false"
        class="w-fit mb-6"
      />

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
