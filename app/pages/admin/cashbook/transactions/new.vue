<script setup lang="ts">
import { ref } from 'vue'
import {
  useCashAccounts,
  useCashbookApi,
  useTransactionCategories,
  type TxType,
} from '~/composables/useCashbook'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Transaksi Baru — Buku Kas' })

const route = useRoute()
const router = useRouter()

const { data: accounts } = useCashAccounts()
const { data: categories } = useTransactionCategories()
const api = useCashbookApi()

const submitting = ref(false)
const error = ref<string | null>(null)

const initialType = (route.query.type as TxType) || 'income'

async function onSubmit(payload: Record<string, unknown>) {
  submitting.value = true
  error.value = null
  try {
    await api.createTransaction(payload)
    await router.push('/admin/cashbook/transactions')
  } catch (e: unknown) {
    const fetchErr = e as { data?: { statusMessage?: string; data?: { errors?: string[] } } }
    error.value =
      fetchErr?.data?.data?.errors?.join(', ') ??
      fetchErr?.data?.statusMessage ??
      'Gagal menyimpan transaksi'
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
    />

    <div class="max-w-3xl">
      <div
        v-if="error"
        class="mb-4 flex items-start gap-2 rounded-cms border border-cms-rose-soft bg-cms-rose-soft text-cms-rose px-3 py-2.5 text-[13px]"
      >
        <Icon name="lucide:alert-circle" class="mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <AdminPanel>
        <AdminCashbookTransactionForm
          :accounts="accounts ?? []"
          :categories="categories ?? []"
          :initial="{ type: initialType }"
          :submitting="submitting"
          submit-label="Simpan Transaksi"
          @submit="onSubmit"
          @cancel="router.push('/admin/cashbook/transactions')"
        />
      </AdminPanel>
    </div>
  </div>
</template>
