<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  useCashAccounts,
  useCashbookApi,
  type CashAccount,
} from '~/composables/useCashbook'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Akun Kas — Buku Kas' })

const { data: accountsData, refresh } = useCashAccounts({ includeArchived: true })
const api = useCashbookApi()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  name: '',
  type: 'cash' as 'cash' | 'bank' | 'ewallet',
  accountNumber: '',
  holderName: '',
  openingBalance: '0',
  sortOrder: 0,
})

function startCreate() {
  Object.assign(form, {
    name: '',
    type: 'cash',
    accountNumber: '',
    holderName: '',
    openingBalance: '0',
    sortOrder: 0,
  })
  editingId.value = null
  showForm.value = true
}

function startEdit(account: CashAccount) {
  Object.assign(form, {
    name: account.name,
    type: account.type,
    accountNumber: account.accountNumber ?? '',
    holderName: account.holderName ?? '',
    openingBalance: account.openingBalance,
    sortOrder: account.sortOrder,
  })
  editingId.value = account.id
  showForm.value = true
}

async function submit() {
  error.value = null
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      type: form.type,
      accountNumber: form.accountNumber.trim() || null,
      holderName: form.holderName.trim() || null,
      openingBalance: form.openingBalance,
      sortOrder: form.sortOrder,
    }
    if (editingId.value) {
      await api.updateAccount(editingId.value, payload)
    } else {
      await api.createAccount(payload)
    }
    showForm.value = false
    await refresh()
  } catch (e: unknown) {
    const fetchErr = e as { data?: { statusMessage?: string; data?: { errors?: string[] } } }
    error.value =
      fetchErr?.data?.data?.errors?.join(', ') ??
      fetchErr?.data?.statusMessage ??
      'Gagal menyimpan akun'
  } finally {
    submitting.value = false
  }
}

async function archive(id: string) {
  if (!confirm('Arsipkan akun ini? Akun masih bisa muncul di transaksi lama.')) return
  try {
    await api.deleteAccount(id)
    await refresh()
  } catch {
    error.value = 'Gagal mengarsipkan akun'
  }
}

const inputCls =
  'w-full h-10 px-3 border border-cms-border rounded-cms bg-cms-surface text-sm text-cms-ink outline-none focus:border-cms-green-700'
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Buku Kas"
      title="Akun Kas"
      description="Kelola akun kas masjid: tunai, rekening bank, dan e-wallet. Saldo dihitung otomatis dari transaksi."
    >
      <template #actions>
        <AdminBtn variant="primary" @click="startCreate">
          <Icon name="lucide:plus" size="16" /> Akun Baru
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <div
      v-if="error"
      class="mb-4 flex items-start gap-2 rounded-cms border border-cms-rose-soft bg-cms-rose-soft text-cms-rose px-3 py-2.5 text-[13px]"
    >
      <Icon name="lucide:alert-circle" class="mt-0.5 shrink-0" />
      <span>{{ error }}</span>
    </div>

    <div v-if="showForm" class="mb-6 max-w-2xl">
      <AdminPanel :title="editingId ? 'Edit Akun' : 'Akun Baru'">
        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField label="Nama Akun" required>
              <input v-model="form.name" type="text" placeholder="cth: Kas Tunai Masjid" :class="inputCls">
            </AdminFormField>
            <AdminFormField label="Tipe" required>
              <select v-model="form.type" :class="inputCls">
                <option value="cash">Tunai</option>
                <option value="bank">Bank</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Nomor Rekening" hint="opsional">
              <input v-model="form.accountNumber" type="text" :class="inputCls">
            </AdminFormField>
            <AdminFormField label="Nama Pemilik" hint="opsional">
              <input v-model="form.holderName" type="text" :class="inputCls">
            </AdminFormField>
            <AdminFormField label="Saldo Awal (Rp)" hint="hanya saat akun dibuat">
              <input
                v-model="form.openingBalance"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.01"
                :class="inputCls"
              >
            </AdminFormField>
            <AdminFormField label="Urutan">
              <input v-model.number="form.sortOrder" type="number" min="0" :class="inputCls">
            </AdminFormField>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <AdminBtn type="button" variant="ghost" @click="showForm = false">Batal</AdminBtn>
            <AdminBtn type="submit" variant="primary" :disabled="submitting">
              <Icon v-if="submitting" name="lucide:loader-2" class="animate-spin" size="16" />
              Simpan
            </AdminBtn>
          </div>
        </form>
      </AdminPanel>
    </div>

    <div v-if="!accountsData?.length" class="text-cms-muted text-sm py-12 text-center bg-cms-surface border border-cms-border rounded-cms-lg">
      Belum ada akun kas. Klik "Akun Baru" untuk mulai.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminCashbookAccountCard
        v-for="a in accountsData"
        :key="a.id"
        :account="a"
        @edit="startEdit(a)"
        @archive="archive"
      />
    </div>
  </div>
</template>
