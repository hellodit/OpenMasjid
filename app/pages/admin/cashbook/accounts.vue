<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { accountCreateSchema, accountUpdateSchema } from '#shared/schemas/cashbook'
import {
  apiErrorMessage,
  useCashAccounts,
  useCashbookApi,
  type AccountType,
  type CashAccount,
} from '~/composables/useCashbook'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Akun Kas — Buku Kas' })

const { isAdmin } = useAuth()
const toast = useToast()
const api = useCashbookApi()

const { data: accountsData, refresh } = await useCashAccounts({ includeArchived: true })

const activeAccounts = computed(() => (accountsData.value ?? []).filter((a) => a.isActive))
const archivedAccounts = computed(() => (accountsData.value ?? []).filter((a) => !a.isActive))

// ── Create / edit form ────────────────────────────────────────────────
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)

const emptyState = () => ({
  name: '',
  type: 'cash' as AccountType,
  accountNumber: '',
  holderName: '',
  openingBalance: '0' as string | number,
  sortOrder: 0,
})
const state = reactive(emptyState())
const schema = computed(() => (editingId.value ? accountUpdateSchema : accountCreateSchema))

const typeItems = [
  { label: 'Tunai', value: 'cash', icon: 'i-lucide-wallet' },
  { label: 'Bank', value: 'bank', icon: 'i-lucide-landmark' },
  { label: 'E-Wallet', value: 'ewallet', icon: 'i-lucide-smartphone' },
]

function startCreate() {
  Object.assign(state, emptyState())
  editingId.value = null
  formOpen.value = true
}

function startEdit(account: CashAccount) {
  Object.assign(state, {
    name: account.name,
    type: account.type,
    accountNumber: account.accountNumber ?? '',
    holderName: account.holderName ?? '',
    openingBalance: account.openingBalance,
    sortOrder: account.sortOrder,
  })
  editingId.value = account.id
  formOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<z.output<typeof accountCreateSchema>>) {
  submitting.value = true
  try {
    if (editingId.value) await api.updateAccount(editingId.value, event.data)
    else await api.createAccount(event.data)
    toast.add({
      color: 'success',
      icon: 'i-lucide-check-circle',
      title: editingId.value ? 'Akun diperbarui' : 'Akun dibuat',
      description: event.data.name,
    })
    formOpen.value = false
    await refresh()
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal menyimpan akun', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  } finally {
    submitting.value = false
  }
}

// ── Archive / restore ─────────────────────────────────────────────────
const archiveTarget = ref<CashAccount | null>(null)
const archiveOpen = computed({
  get: () => !!archiveTarget.value,
  set: (v) => { if (!v) archiveTarget.value = null },
})
const archiving = ref(false)

async function confirmArchive() {
  const target = archiveTarget.value
  if (!target) return
  archiving.value = true
  try {
    const res = await api.deleteAccount(target.id)
    toast.add({
      color: 'success',
      icon: 'i-lucide-archive',
      title: 'archived' in res ? 'Akun diarsipkan' : 'Akun dihapus',
      description: target.name,
    })
    archiveTarget.value = null
    await refresh()
  } catch (e) {
    // 409 when the balance is not zero — the server explains what to do.
    toast.add({ color: 'error', title: 'Tidak dapat mengarsipkan akun', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  } finally {
    archiving.value = false
  }
}

async function restore(account: CashAccount) {
  try {
    await api.updateAccount(account.id, { isActive: true })
    toast.add({ color: 'success', icon: 'i-lucide-archive-restore', title: 'Akun diaktifkan kembali', description: account.name })
    await refresh()
  } catch (e) {
    toast.add({ color: 'error', title: 'Gagal mengaktifkan akun', description: apiErrorMessage(e, 'Terjadi kesalahan') })
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Akun Kas"
      description="Kelola akun kas masjid: tunai, rekening bank, dan e-wallet. Saldo dihitung otomatis dari transaksi."
    >
      <template #actions>
        <UButton v-if="isAdmin" icon="i-lucide-plus" label="Akun Baru" class="font-semibold" @click="startCreate" />
      </template>
    </AdminPageHeader>

    <div
      v-if="!accountsData?.length"
      class="text-cms-muted text-sm py-12 text-center bg-cms-surface border border-cms-border rounded-cms-lg"
    >
      Belum ada akun kas.<template v-if="isAdmin"> Klik "Akun Baru" untuk mulai.</template>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminCashbookAccountCard
          v-for="a in activeAccounts"
          :key="a.id"
          :account="a"
          :can-edit="isAdmin"
          @edit="startEdit(a)"
          @archive="archiveTarget = a"
        />
      </div>

      <template v-if="archivedAccounts.length">
        <h3 class="font-serif text-[18px] font-semibold mt-8 mb-3">Akun Diarsipkan</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminCashbookAccountCard
            v-for="a in archivedAccounts"
            :key="a.id"
            :account="a"
            :can-edit="isAdmin"
            @edit="startEdit(a)"
            @restore="restore(a)"
          />
        </div>
      </template>
    </template>

    <UModal
      v-model:open="formOpen"
      :title="editingId ? 'Edit Akun' : 'Akun Baru'"
      description="Saldo dihitung dari saldo awal ditambah seluruh transaksi akun ini."
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Nama Akun" name="name" required>
              <UInput v-model="state.name" placeholder="cth: Kas Tunai Masjid" class="w-full" />
            </UFormField>
            <UFormField label="Tipe" name="type" required>
              <USelect v-model="state.type" :items="typeItems" class="w-full" />
            </UFormField>
            <UFormField label="Nomor Rekening" name="accountNumber" hint="opsional">
              <UInput v-model="state.accountNumber" class="w-full" />
            </UFormField>
            <UFormField label="Nama Pemilik" name="holderName" hint="opsional">
              <UInput v-model="state.holderName" class="w-full" />
            </UFormField>
            <UFormField
              label="Saldo Awal (Rp)"
              name="openingBalance"
              :help="editingId ? 'Mengubah saldo awal ikut mengubah saldo akhir.' : undefined"
            >
              <UInput
                v-model="state.openingBalance"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.01"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Urutan" name="sortOrder">
              <UInputNumber v-model="state.sortOrder" :min="0" :max="9999" class="w-full" />
            </UFormField>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="ghost" label="Batal" @click="formOpen = false" />
            <UButton type="submit" icon="i-lucide-save" label="Simpan" :loading="submitting" class="font-semibold" />
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="archiveOpen"
      title="Arsipkan akun?"
      :description="`Akun “${archiveTarget?.name ?? ''}” tidak bisa dipakai untuk transaksi baru. Saldo harus 0; akun tanpa transaksi akan dihapus.`"
    >
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Batal" @click="archiveTarget = null" />
          <UButton color="error" icon="i-lucide-archive" label="Arsipkan" :loading="archiving" @click="confirmArchive" />
        </div>
      </template>
    </UModal>
  </div>
</template>
