<script setup lang="ts">
import { formatDate, formatRupiah, timeAgo, transactionTypeLabel } from '~/utils/format'
import {
  apiErrorMessage,
  useCashAccounts,
  useCashbookApi,
  useTransactionCategories,
} from '~/composables/useCashbook'
import type { TransactionFormOutput } from '~/components/admin/cashbook/TransactionForm.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Detail Transaksi — Buku Kas' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { isAdmin } = useAuth()
const id = route.params.id as string

const { data: txDetail, refresh, error: loadError } = await useFetch(`/api/admin/cashbook/transactions/${id}`)

// Archived accounts/categories are included so an old transaction still shows its current values.
const { data: accounts } = await useCashAccounts({ includeArchived: true })
const { data: categories } = await useTransactionCategories({ includeArchived: true })
const api = useCashbookApi()

const editing = ref(false)
const submitting = ref(false)
const confirmDelete = ref(false)
const deleting = ref(false)

const tx = computed(() => txDetail.value?.transaction)

async function onUpdate(payload: TransactionFormOutput) {
  submitting.value = true
  try {
    // `type` is immutable server-side. Shape rules: transfers carry a
    // destination and no category, income/expense the other way round.
    await api.updateTransaction(id, {
      transactionDate: payload.transactionDate,
      accountId: payload.accountId,
      amount: payload.amount,
      description: payload.description,
      referenceNumber: payload.referenceNumber,
      attachmentUrl: payload.attachmentUrl,
      categoryId: payload.type === 'transfer' ? null : payload.categoryId,
      destinationAccountId: payload.type === 'transfer' ? payload.destinationAccountId : null,
    })
    editing.value = false
    await refresh()
    toast.add({ color: 'success', title: 'Perubahan tersimpan', icon: 'i-lucide-check-circle' })
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal menyimpan', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  } finally {
    submitting.value = false
  }
}

async function onDelete() {
  deleting.value = true
  try {
    await api.deleteTransaction(id)
    confirmDelete.value = false
    toast.add({ color: 'success', title: 'Transaksi dihapus', icon: 'i-lucide-trash-2' })
    await router.push('/admin/cashbook/transactions')
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal menghapus transaksi', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  } finally {
    deleting.value = false
  }
}

const typeBadge = computed(() => {
  const t = tx.value?.type
  if (t === 'income') return 'bg-cms-green-100 text-cms-green-800'
  if (t === 'expense') return 'bg-cms-rose-soft text-cms-rose'
  return 'bg-cms-info-soft text-cms-info'
})
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      :title="editing ? 'Edit Transaksi' : 'Detail Transaksi'"
    >
      <template #actions>
        <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" to="/admin/cashbook/transactions" label="Kembali" />
      </template>
    </AdminPageHeader>

    <UAlert
      v-if="loadError || !txDetail || !tx"
      color="error"
      variant="subtle"
      icon="i-lucide-alert-circle"
      title="Transaksi tidak ditemukan"
      :description="loadError?.statusMessage ?? 'Transaksi mungkin sudah dihapus.'"
      class="max-w-3xl"
    />

    <div v-else class="max-w-3xl">
      <AdminPanel v-if="!editing">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span :class="['inline-block text-[12px] font-semibold px-2 py-0.5 rounded-full', typeBadge]">
              {{ transactionTypeLabel(tx.type) }}
            </span>
            <div class="font-serif text-[32px] font-semibold mt-2">
              {{ formatRupiah(tx.amount) }}
            </div>
            <div class="text-cms-muted text-sm">{{ formatDate(tx.transactionDate) }}</div>
          </div>
          <div v-if="isAdmin" class="flex gap-2">
            <UButton color="neutral" variant="outline" icon="i-lucide-pencil" label="Edit" @click="editing = true" />
            <UButton color="error" variant="outline" icon="i-lucide-trash-2" label="Hapus" @click="confirmDelete = true" />
          </div>
        </div>

        <hr class="my-5 border-cms-border">

        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">
              {{ tx.type === 'transfer' ? 'Akun Sumber' : 'Akun' }}
            </dt>
            <dd class="m-0">{{ txDetail.account?.name ?? '—' }}</dd>
          </div>
          <div v-if="tx.type === 'transfer'">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Akun Tujuan</dt>
            <dd class="m-0">{{ txDetail.destinationAccount?.name ?? '—' }}</dd>
          </div>
          <div v-else>
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Kategori</dt>
            <dd class="m-0 inline-flex items-center gap-1.5" :style="txDetail.category?.colorToken ? `color:${txDetail.category.colorToken}` : ''">
              <Icon v-if="txDetail.category" :name="txDetail.category.icon ?? 'lucide:tag'" size="14" />
              {{ txDetail.category?.name ?? '—' }}
            </dd>
          </div>
          <div class="md:col-span-2">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Deskripsi</dt>
            <dd class="m-0 whitespace-pre-line">{{ tx.description }}</dd>
          </div>
          <div v-if="tx.referenceNumber">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">No. Referensi</dt>
            <dd class="m-0 font-mono">{{ tx.referenceNumber }}</dd>
          </div>
          <div v-if="tx.attachmentUrl">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Bukti</dt>
            <dd class="m-0">
              <ULink :to="tx.attachmentUrl" target="_blank" rel="noopener" class="text-cms-green-700 hover:underline">
                Lihat bukti ↗
              </ULink>
            </dd>
          </div>
          <div>
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Dicatat oleh</dt>
            <dd class="m-0">
              {{ txDetail.createdBy?.fullName ?? '—' }}
              <span class="text-cms-muted text-[12px]">· {{ timeAgo(tx.createdAt) }}</span>
            </dd>
          </div>
          <div v-if="txDetail.updatedBy && tx.updatedAt !== tx.createdAt">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Terakhir diedit oleh</dt>
            <dd class="m-0">
              {{ txDetail.updatedBy.fullName }}
              <span class="text-cms-muted text-[12px]">· {{ timeAgo(tx.updatedAt) }}</span>
            </dd>
          </div>
        </dl>
      </AdminPanel>

      <AdminCashbookTransactionForm
        v-else
        :accounts="accounts ?? []"
        :categories="categories ?? []"
        :initial="{
          type: tx.type,
          transactionDate: tx.transactionDate,
          accountId: tx.accountId,
          destinationAccountId: tx.destinationAccountId,
          categoryId: tx.categoryId,
          amount: tx.amount,
          description: tx.description,
          referenceNumber: tx.referenceNumber,
          attachmentUrl: tx.attachmentUrl,
        }"
        lock-type
        :submitting="submitting"
        submit-label="Simpan Perubahan"
        @submit="onUpdate"
        @cancel="editing = false"
      />
    </div>

    <UModal
      v-model:open="confirmDelete"
      title="Hapus transaksi?"
      description="Saldo akun terkait akan ikut disesuaikan. Tindakan ini tidak dapat dibatalkan dari CMS."
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Batal" @click="confirmDelete = false" />
          <UButton color="error" icon="i-lucide-trash-2" label="Hapus" :loading="deleting" @click="onDelete" />
        </div>
      </template>
    </UModal>
  </div>
</template>
