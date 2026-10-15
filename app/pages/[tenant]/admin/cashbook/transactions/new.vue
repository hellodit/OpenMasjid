<script setup lang="ts">
import {
  apiErrorMessage,
  useCashAccounts,
  useCashbookApi,
  useTransactionCategories,
  type TxType,
} from '~/composables/useCashbook'
import type { TransactionFormOutput } from '~/components/admin/cashbook/TransactionForm.vue'
const tp = useTenantPath()

definePageMeta({ layout: 'admin' })
useHead({ title: 'Transaksi Baru — Buku Kas' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { isAdmin } = useAuth()

const { data: accounts } = await useCashAccounts()
const { data: categories } = await useTransactionCategories()
const api = useCashbookApi()

const submitting = ref(false)

const queryType = route.query.type
const initialType: TxType =
  queryType === 'expense' || queryType === 'transfer' ? queryType : 'income'

async function onSubmit(payload: TransactionFormOutput) {
  submitting.value = true
  try {
    const row = await api.createTransaction(payload)
    toast.add({ color: 'success', title: 'Transaksi tersimpan', icon: 'i-lucide-check-circle' })
    await router.push(tp(row?.id ? `/admin/cashbook/transactions/${row.id}` : '/admin/cashbook/transactions'))
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal menyimpan transaksi', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Transaksi Baru"
      description="Catat pemasukan, pengeluaran, atau transfer antar akun kas."
    >
      <template #actions>
        <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" :to="tp('/admin/cashbook/transactions')" label="Kembali" />
      </template>
    </AdminPageHeader>

    <div class="max-w-3xl">
      <UAlert
        v-if="!isAdmin"
        color="warning"
        variant="subtle"
        icon="i-lucide-lock"
        title="Akses baca saja"
        description="Akun Anda hanya dapat melihat buku kas. Hubungi admin untuk mencatat transaksi."
      />
      <AdminCashbookTransactionForm
        v-else
        :accounts="accounts ?? []"
        :categories="categories ?? []"
        :initial="{ type: initialType }"
        :submitting="submitting"
        submit-label="Simpan Transaksi"
        @submit="onSubmit"
        @cancel="router.push(tp('/admin/cashbook/transactions'))"
      />
    </div>
  </div>
</template>
