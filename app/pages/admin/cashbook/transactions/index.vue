<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  useCashAccounts,
  useTransactionCategories,
  useTransactions,
  type TransactionFilters,
} from '~/composables/useCashbook'
import { useAuthSession } from '~/composables/useAuthSession'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Transaksi — Buku Kas' })

const filters = ref<TransactionFilters>({ page: 1, pageSize: 25 })
const baseFilters = ref<Omit<TransactionFilters, 'page' | 'pageSize'>>({})

watch(
  baseFilters,
  (val) => {
    filters.value = { ...val, page: 1, pageSize: 25 }
  },
  { deep: true },
)

const { data: txData, pending } = useTransactions(filters)
const { data: accounts } = useCashAccounts()
const { data: categories } = useTransactionCategories({ includeArchived: true })
const { authHeaders } = useAuthSession()

const router = useRouter()

function go(page: number) {
  filters.value = { ...filters.value, page }
}

async function exportCsv() {
  const params = new URLSearchParams()
  if (filters.value.from) params.set('from', filters.value.from)
  if (filters.value.to) params.set('to', filters.value.to)
  const res = await fetch(`/api/admin/cashbook/reports/export?${params.toString()}`, {
    headers: authHeaders(),
  })
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `buku-kas-${filters.value.from ?? 'all'}_${filters.value.to ?? 'now'}.csv`
  a.click()
  URL.revokeObjectURL(url)
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
        <AdminBtn variant="ghost" @click="exportCsv">
          <Icon name="lucide:download" size="16" /> Export CSV
        </AdminBtn>
        <AdminBtn to="/admin/cashbook/transactions/new" variant="primary">
          <Icon name="lucide:plus" size="16" /> Transaksi Baru
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <CashbookTransactionFilters
      v-model="baseFilters"
      :accounts="accounts ?? []"
      :categories="categories ?? []"
    />

    <CashbookTransactionTable
      :rows="txData?.data ?? []"
      :loading="pending"
      @open="(id: string) => router.push(`/admin/cashbook/transactions/${id}`)"
    />

    <div
      v-if="txData?.pagination && txData.pagination.totalPages > 1"
      class="flex items-center justify-between mt-4"
    >
      <div class="text-[13px] text-cms-muted">
        Total {{ txData.pagination.total }} transaksi · Halaman {{ txData.pagination.page }} dari {{ txData.pagination.totalPages }}
      </div>
      <div class="flex gap-1.5">
        <AdminBtn
          size="sm"
          variant="ghost"
          :disabled="txData.pagination.page <= 1"
          @click="go(txData.pagination.page - 1)"
        >
          ← Sebelumnya
        </AdminBtn>
        <AdminBtn
          size="sm"
          variant="ghost"
          :disabled="txData.pagination.page >= txData.pagination.totalPages"
          @click="go(txData.pagination.page + 1)"
        >
          Selanjutnya →
        </AdminBtn>
      </div>
    </div>
  </div>
</template>
