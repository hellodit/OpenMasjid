<script setup lang="ts">
import { accountTypeIcon, accountTypeLabel, todayIso } from '~/utils/format'
import type { FormError, FormSubmitEvent, SelectMenuItem } from '@nuxt/ui'
import type { z } from 'zod'
import { transactionCreateSchema } from '#shared/schemas/cashbook'
import {
  categoriesAsTree,
  type CashAccount,
  type TransactionCategory,
  type TxType,
} from '~/composables/useCashbook'

export type TransactionFormOutput = z.output<typeof transactionCreateSchema>

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
  /** In edit mode the type is fixed (the API does not allow changing it). */
  lockType?: boolean
  submitting?: boolean
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [payload: TransactionFormOutput]
  cancel: []
}>()

const state = reactive({
  type: (props.initial?.type ?? 'income') as TxType,
  transactionDate: props.initial?.transactionDate ?? todayIso(),
  accountId: props.initial?.accountId ?? undefined,
  destinationAccountId: props.initial?.destinationAccountId ?? undefined,
  categoryId: props.initial?.categoryId ?? undefined,
  amount: props.initial?.amount ?? '',
  description: props.initial?.description ?? '',
  referenceNumber: props.initial?.referenceNumber ?? '',
  attachmentUrl: props.initial?.attachmentUrl ?? '',
})

const typeOptions = [
  { v: 'income', label: 'Pemasukan', icon: 'i-lucide-arrow-down-circle' },
  { v: 'expense', label: 'Pengeluaran', icon: 'i-lucide-arrow-up-circle' },
  { v: 'transfer', label: 'Transfer', icon: 'i-lucide-repeat' },
] as const

function setType(t: TxType) {
  if (props.lockType || state.type === t) return
  state.type = t
  state.categoryId = undefined
  state.destinationAccountId = undefined
}

// Active accounts only — plus the currently selected one when editing an old
// transaction that points at an archived account.
const accountItems = computed(() =>
  props.accounts
    .filter((a) => a.isActive || a.id === props.initial?.accountId || a.id === props.initial?.destinationAccountId)
    .map((a) => ({
      label: a.name,
      value: a.id,
      description: accountTypeLabel(a.type),
      icon: accountTypeIcon(a.type).replace('lucide:', 'i-lucide-'),
    })),
)
const destAccountItems = computed(() => accountItems.value.filter((a) => a.value !== state.accountId))

/** Parent categories with their children grouped underneath (separator between groups). */
const categoryItems = computed<SelectMenuItem[][]>(() => {
  const ofType = props.categories.filter(
    (c) => c.type === state.type && (c.isActive || c.id === props.initial?.categoryId),
  )
  return categoriesAsTree(ofType).map((parent) => [
    { label: parent.name, value: parent.id, icon: toUiIcon(parent.icon) ?? 'i-lucide-tag' },
    ...parent.children.map((child) => ({
      label: child.name,
      value: child.id,
      icon: toUiIcon(child.icon) ?? 'i-lucide-corner-down-right',
      class: 'ps-6',
    })),
  ])
})

function toUiIcon(icon: string | null): string | undefined {
  if (!icon) return undefined
  return icon.includes(':') ? `i-${icon.replace(':', '-')}` : icon
}

function validate(s: { type?: TxType; accountId?: string; destinationAccountId?: string }): FormError[] {
  const errors: FormError[] = []
  if (s.type === 'transfer' && s.destinationAccountId && s.destinationAccountId === s.accountId)
    errors.push({ name: 'destinationAccountId', message: 'Akun tujuan harus berbeda dari akun sumber' })
  return errors
}

function onSubmit(event: FormSubmitEvent<TransactionFormOutput>) {
  emit('submit', event.data)
}
</script>

<template>
  <UForm
    :schema="transactionCreateSchema"
    :state="state"
    :validate="validate"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <AdminFormSection title="Tipe Transaksi">
      <div class="grid grid-cols-3 gap-2">
        <UButton
          v-for="opt in typeOptions"
          :key="opt.v"
          type="button"
          size="lg"
          block
          :icon="opt.icon"
          :label="opt.label"
          :color="state.type === opt.v ? 'primary' : 'neutral'"
          :variant="state.type === opt.v ? 'soft' : 'outline'"
          :disabled="lockType && state.type !== opt.v"
          class="font-semibold"
          @click="setType(opt.v)"
        />
      </div>
      <p v-if="lockType" class="text-[12px] text-cms-muted mt-2 mb-0">
        Tipe transaksi tidak dapat diubah setelah dicatat.
      </p>
    </AdminFormSection>

    <AdminFormSection title="Detail">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Tanggal" name="transactionDate" required>
          <UInput v-model="state.transactionDate" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Nominal (Rp)" name="amount" required>
          <UInput
            v-model="state.amount"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            icon="i-lucide-banknote"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="state.type === 'transfer' ? 'Akun Sumber' : 'Akun'" name="accountId" required>
          <USelectMenu
            v-model="state.accountId"
            :items="accountItems"
            value-key="value"
            placeholder="Pilih akun…"
            :search-input="{ placeholder: 'Cari akun…' }"
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="state.type === 'transfer'" label="Akun Tujuan" name="destinationAccountId" required>
          <USelectMenu
            v-model="state.destinationAccountId"
            :items="destAccountItems"
            value-key="value"
            placeholder="Pilih akun tujuan…"
            :search-input="{ placeholder: 'Cari akun…' }"
            class="w-full"
          />
        </UFormField>

        <UFormField v-else label="Kategori" name="categoryId" required>
          <USelectMenu
            v-model="state.categoryId"
            :items="categoryItems"
            value-key="value"
            placeholder="Pilih kategori…"
            :search-input="{ placeholder: 'Cari kategori…' }"
            class="w-full"
          />
        </UFormField>
      </div>
    </AdminFormSection>

    <AdminFormSection title="Catatan">
      <div class="grid grid-cols-1 gap-4">
        <UFormField label="Deskripsi" name="description" required>
          <UTextarea
            v-model="state.description"
            :rows="2"
            autoresize
            placeholder="cth: Infaq Jum'at minggu ke-3 Mei"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="No. Referensi / Kwitansi" name="referenceNumber" hint="opsional">
            <UInput v-model="state.referenceNumber" class="w-full" />
          </UFormField>
          <UFormField label="URL Bukti" name="attachmentUrl" hint="opsional">
            <UInput v-model="state.attachmentUrl" type="url" placeholder="https://…" icon="i-lucide-link" class="w-full" />
          </UFormField>
        </div>
      </div>
    </AdminFormSection>

    <div class="flex justify-end gap-2 pt-2">
      <UButton type="button" color="neutral" variant="ghost" label="Batal" @click="emit('cancel')" />
      <UButton
        type="submit"
        icon="i-lucide-save"
        :loading="submitting"
        :label="submitLabel ?? 'Simpan Transaksi'"
        class="font-semibold"
      />
    </div>
  </UForm>
</template>
