<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  CashAccount,
  TransactionCategory,
  TxType,
} from '~/composables/useCashbook'
import { todayIso } from '~/utils/format'

const props = defineProps<{
  accounts: CashAccount[]
  categories: TransactionCategory[]
  initial?: {
    type?: TxType
    transactionDate?: string
    accountId?: string
    destinationAccountId?: string | null
    categoryId?: string | null
    amount?: string
    description?: string
    referenceNumber?: string | null
    attachmentUrl?: string | null
  } | null
  submitting?: boolean
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [payload: Record<string, unknown>]
  cancel: []
}>()

const type = ref<TxType>(props.initial?.type ?? 'income')
const transactionDate = ref(props.initial?.transactionDate ?? todayIso())
const accountId = ref(props.initial?.accountId ?? '')
const destinationAccountId = ref(props.initial?.destinationAccountId ?? '')
const categoryId = ref(props.initial?.categoryId ?? '')
const amount = ref(props.initial?.amount ?? '')
const description = ref(props.initial?.description ?? '')
const referenceNumber = ref(props.initial?.referenceNumber ?? '')
const attachmentUrl = ref(props.initial?.attachmentUrl ?? '')
const error = ref<string | null>(null)

const filteredCategories = computed(() =>
  props.categories.filter((c) => c.type === type.value && c.isActive),
)

const destAccountOptions = computed(() =>
  props.accounts.filter((a) => a.id !== accountId.value),
)

watch(type, () => {
  categoryId.value = ''
  destinationAccountId.value = ''
})

function submit() {
  error.value = null
  if (!transactionDate.value) return (error.value = 'Tanggal wajib diisi')
  if (!accountId.value) return (error.value = 'Akun sumber wajib dipilih')
  if (!amount.value || Number(amount.value) <= 0) return (error.value = 'Nominal harus > 0')
  if (!description.value.trim()) return (error.value = 'Deskripsi wajib diisi')

  if (type.value === 'transfer') {
    if (!destinationAccountId.value) return (error.value = 'Akun tujuan wajib dipilih')
    if (destinationAccountId.value === accountId.value)
      return (error.value = 'Akun tujuan harus berbeda dari sumber')
  } else if (!categoryId.value) {
    return (error.value = 'Kategori wajib dipilih')
  }

  const payload: Record<string, unknown> = {
    type: type.value,
    transactionDate: transactionDate.value,
    accountId: accountId.value,
    amount: amount.value,
    description: description.value.trim(),
    referenceNumber: referenceNumber.value.trim() || null,
    attachmentUrl: attachmentUrl.value.trim() || null,
  }
  if (type.value === 'transfer') payload.destinationAccountId = destinationAccountId.value
  else payload.categoryId = categoryId.value
  emit('submit', payload)
}

const inputCls =
  'w-full h-10 px-3 border border-cms-border rounded-cms bg-cms-surface text-sm text-cms-ink outline-none focus:border-cms-green-700'
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="submit">
    <div
      v-if="error"
      class="flex items-start gap-2 rounded-cms border border-cms-rose-soft bg-cms-rose-soft text-cms-rose px-3 py-2.5 text-[13px]"
    >
      <Icon name="lucide:alert-circle" class="mt-0.5 shrink-0" />
      <span>{{ error }}</span>
    </div>

    <AdminFormSection title="Tipe Transaksi">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="opt in [
            { v: 'income', label: 'Pemasukan', icon: 'lucide:arrow-down-circle' },
            { v: 'expense', label: 'Pengeluaran', icon: 'lucide:arrow-up-circle' },
            { v: 'transfer', label: 'Transfer', icon: 'lucide:repeat' },
          ] as const"
          :key="opt.v"
          type="button"
          :class="[
            'flex items-center justify-center gap-2 h-11 rounded-cms border font-semibold text-sm transition-colors',
            type === opt.v
              ? 'border-cms-green-700 bg-cms-green-100 text-cms-green-800'
              : 'border-cms-border bg-cms-surface text-cms-ink-2 hover:bg-cms-surface-2',
          ]"
          @click="type = opt.v"
        >
          <Icon :name="opt.icon" size="16" />
          {{ opt.label }}
        </button>
      </div>
    </AdminFormSection>

    <AdminFormSection title="Detail">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminFormField label="Tanggal" required>
          <input v-model="transactionDate" type="date" :class="inputCls">
        </AdminFormField>

        <AdminFormField label="Nominal (Rp)" required>
          <input
            v-model="amount"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            :class="inputCls"
          >
        </AdminFormField>

        <AdminFormField :label="type === 'transfer' ? 'Akun Sumber' : 'Akun'" required>
          <select v-model="accountId" :class="inputCls">
            <option value="">Pilih akun…</option>
            <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </AdminFormField>

        <AdminFormField v-if="type === 'transfer'" label="Akun Tujuan" required>
          <select v-model="destinationAccountId" :class="inputCls">
            <option value="">Pilih akun tujuan…</option>
            <option v-for="a in destAccountOptions" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </AdminFormField>

        <AdminFormField v-else label="Kategori" required>
          <select v-model="categoryId" :class="inputCls">
            <option value="">Pilih kategori…</option>
            <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
              {{ c.parentId ? '— ' : '' }}{{ c.name }}
            </option>
          </select>
        </AdminFormField>
      </div>
    </AdminFormSection>

    <AdminFormSection title="Catatan">
      <div class="grid grid-cols-1 gap-4">
        <AdminFormField label="Deskripsi" required>
          <textarea
            v-model="description"
            rows="2"
            placeholder="cth: Infaq Jum'at minggu ke-3 Mei"
            :class="[inputCls, 'h-auto py-2 leading-relaxed']"
          />
        </AdminFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminFormField label="No. Referensi / Kwitansi" hint="opsional">
            <input v-model="referenceNumber" type="text" :class="inputCls">
          </AdminFormField>
          <AdminFormField label="URL Bukti" hint="opsional">
            <input v-model="attachmentUrl" type="url" placeholder="https://…" :class="inputCls">
          </AdminFormField>
        </div>
      </div>
    </AdminFormSection>

    <div class="flex justify-end gap-2 pt-2">
      <AdminBtn type="button" variant="ghost" @click="emit('cancel')">Batal</AdminBtn>
      <AdminBtn type="submit" variant="primary" :disabled="submitting">
        <Icon v-if="submitting" name="lucide:loader-2" class="animate-spin" size="16" />
        {{ submitLabel ?? 'Simpan Transaksi' }}
      </AdminBtn>
    </div>
  </form>
</template>
