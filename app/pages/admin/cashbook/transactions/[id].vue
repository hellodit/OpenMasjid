<script setup lang="ts">
import { ref } from 'vue'
import {
  useCashAccounts,
  useCashbookApi,
  useTransactionCategories,
} from '~/composables/useCashbook'
import { useAuthSession } from '~/composables/useAuthSession'
import { formatDate, formatRupiah, transactionTypeLabel } from '~/utils/format'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Detail Transaksi — Buku Kas' })

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const { authHeaders } = useAuthSession()

const { data: txDetail, refresh, pending } = await useFetch<{
  transaction: {
    id: string
    type: 'income' | 'expense' | 'transfer'
    transactionDate: string
    accountId: string
    destinationAccountId: string | null
    categoryId: string | null
    amount: string
    description: string
    referenceNumber: string | null
    attachmentUrl: string | null
    createdAt: string
    updatedAt: string
  }
  account: { id: string; name: string; type: string } | null
  destinationAccount: { id: string; name: string; type: string } | null
  category: { id: string; name: string; colorToken: string | null; icon: string | null } | null
  createdBy: { id: string; fullName: string } | null
  updatedBy: { id: string; fullName: string } | null
}>(`/api/admin/cashbook/transactions/${id}`, { headers: authHeaders() })

const { data: accounts } = useCashAccounts()
const { data: categories } = useTransactionCategories()
const api = useCashbookApi()

const editing = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

async function onUpdate(payload: Record<string, unknown>) {
  submitting.value = true
  error.value = null
  try {
    const { type: _ignored, ...updateBody } = payload
    await api.updateTransaction(id, updateBody)
    editing.value = false
    await refresh()
  } catch (e: unknown) {
    const fetchErr = e as { data?: { statusMessage?: string; data?: { errors?: string[] } } }
    error.value =
      fetchErr?.data?.data?.errors?.join(', ') ??
      fetchErr?.data?.statusMessage ??
      'Gagal menyimpan'
  } finally {
    submitting.value = false
  }
}

async function onDelete() {
  if (!confirm('Hapus transaksi ini? Saldo akan ikut disesuaikan.')) return
  try {
    await api.deleteTransaction(id)
    await router.push('/admin/cashbook/transactions')
  } catch {
    error.value = 'Gagal menghapus transaksi'
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      :title="editing ? 'Edit Transaksi' : 'Detail Transaksi'"
    >
      <template #actions>
        <AdminBtn variant="ghost" to="/admin/cashbook/transactions">
          <Icon name="lucide:arrow-left" size="16" /> Kembali
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <div v-if="pending" class="text-cms-muted">Memuat…</div>

    <div v-else-if="txDetail" class="max-w-3xl">
      <div
        v-if="error"
        class="mb-4 flex items-start gap-2 rounded-cms border border-cms-rose-soft bg-cms-rose-soft text-cms-rose px-3 py-2.5 text-[13px]"
      >
        <Icon name="lucide:alert-circle" class="mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <AdminPanel v-if="!editing">
        <div class="flex items-start justify-between">
          <div>
            <span
              :class="[
                'inline-block text-[12px] font-semibold px-2 py-0.5 rounded-full',
                txDetail.transaction.type === 'income' && 'bg-cms-green-100 text-cms-green-800',
                txDetail.transaction.type === 'expense' && 'bg-cms-rose-soft text-cms-rose',
                txDetail.transaction.type === 'transfer' && 'bg-cms-info-soft text-cms-info',
              ]"
            >
              {{ transactionTypeLabel(txDetail.transaction.type) }}
            </span>
            <div class="font-serif text-[32px] font-semibold mt-2">
              {{ formatRupiah(txDetail.transaction.amount) }}
            </div>
            <div class="text-cms-muted text-sm">{{ formatDate(txDetail.transaction.transactionDate) }}</div>
          </div>
          <div class="flex gap-2">
            <AdminBtn variant="ghost" @click="editing = true">
              <Icon name="lucide:edit-2" size="16" /> Edit
            </AdminBtn>
            <AdminBtn variant="danger" @click="onDelete">
              <Icon name="lucide:trash-2" size="16" /> Hapus
            </AdminBtn>
          </div>
        </div>

        <hr class="my-5 border-cms-border">

        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Akun</dt>
            <dd>{{ txDetail.account?.name ?? '—' }}</dd>
          </div>
          <div v-if="txDetail.transaction.type === 'transfer'">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Akun Tujuan</dt>
            <dd>{{ txDetail.destinationAccount?.name ?? '—' }}</dd>
          </div>
          <div v-else>
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Kategori</dt>
            <dd>{{ txDetail.category?.name ?? '—' }}</dd>
          </div>
          <div class="md:col-span-2">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Deskripsi</dt>
            <dd class="whitespace-pre-line">{{ txDetail.transaction.description }}</dd>
          </div>
          <div v-if="txDetail.transaction.referenceNumber">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">No. Referensi</dt>
            <dd class="font-mono">{{ txDetail.transaction.referenceNumber }}</dd>
          </div>
          <div v-if="txDetail.transaction.attachmentUrl">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Bukti</dt>
            <dd>
              <a
                :href="txDetail.transaction.attachmentUrl"
                target="_blank"
                rel="noopener"
                class="text-cms-green-700 hover:underline"
              >Lihat bukti ↗</a>
            </dd>
          </div>
          <div>
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Dicatat oleh</dt>
            <dd>{{ txDetail.createdBy?.fullName ?? '—' }}</dd>
          </div>
          <div v-if="txDetail.updatedBy">
            <dt class="text-[12px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Terakhir diedit oleh</dt>
            <dd>{{ txDetail.updatedBy.fullName }}</dd>
          </div>
        </dl>
      </AdminPanel>

      <AdminPanel v-else>
        <AdminCashbookTransactionForm
          :accounts="accounts ?? []"
          :categories="categories ?? []"
          :initial="{
            type: txDetail.transaction.type,
            transactionDate: txDetail.transaction.transactionDate,
            accountId: txDetail.transaction.accountId,
            destinationAccountId: txDetail.transaction.destinationAccountId,
            categoryId: txDetail.transaction.categoryId,
            amount: txDetail.transaction.amount,
            description: txDetail.transaction.description,
            referenceNumber: txDetail.transaction.referenceNumber,
            attachmentUrl: txDetail.transaction.attachmentUrl,
          }"
          :submitting="submitting"
          submit-label="Simpan Perubahan"
          @submit="onUpdate"
          @cancel="editing = false"
        />
      </AdminPanel>
    </div>
  </div>
</template>
