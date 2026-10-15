<script setup lang="ts">
import {
  useCashAccounts,
  useTransactionCategories,
  useTransactions,
  type TransactionFilters,
} from '~/composables/useCashbook'
import type { TransactionFilterValue } from '~/components/admin/cashbook/TransactionFilters.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Transaksi — Buku Kas' })

const PAGE_SIZE = 25
const { isAdmin } = useAuth()

const filters = ref<TransactionFilters>({ page: 1, pageSize: PAGE_SIZE })
const baseFilters = ref<TransactionFilterValue>({})

watch(baseFilters, (val) => {
  filters.value = { ...val, page: 1, pageSize: PAGE_SIZE }
})

const [{ data: txData, pending }, { data: accounts }, { data: categories }] = await Promise.all([
  useTransactions(filters),
  useCashAccounts({ includeArchived: true }),
  useTransactionCategories({ includeArchived: true }),
])

const router = useRouter()

function go(page: number) {
  filters.value = { ...filters.value, page }
}

function exportCsv() {
  // Cookie-authenticated GET; the server responds with Content-Disposition: attachment.
  const params = new URLSearchParams()
  if (filters.value.from) params.set('from', filters.value.from)
  if (filters.value.to) params.set('to', filters.value.to)
  window.location.href = `/api/admin/cashbook/reports/export?${params}`
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Daftar Transaksi"
      description="Catatan lengkap semua pemasukan, pengeluaran, dan transfer antar akun."
    >
      <template #actions>
        <UButton color="neutral" variant="ghost" icon="i-lucide-download" label="Export CSV" @click="exportCsv" />
        <UButton v-if="isAdmin" to="/admin/cashbook/transactions/new" icon="i-lucide-plus" label="Transaksi Baru" class="font-semibold" />
      </template>
    </AdminPageHeader>

    <AdminCashbookTransactionFilters
      v-model="baseFilters"
      :accounts="accounts ?? []"
      :categories="categories ?? []"
    />

    <AdminCashbookTransactionTable
      :rows="txData?.data ?? []"
      :loading="pending"
      :pagination="txData?.pagination"
      @open="(id: string) => router.push(`/admin/cashbook/transactions/${id}`)"
      @update:page="go"
    />
  </div>
</template>
