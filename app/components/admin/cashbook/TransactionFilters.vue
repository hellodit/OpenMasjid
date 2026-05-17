<script setup lang="ts">
import { computed } from 'vue'
import type { CashAccount, TransactionCategory, TxType } from '~/composables/useCashbook'
import { firstOfMonthIso, todayIso } from '~/utils/format'

const props = defineProps<{
  modelValue: {
    from?: string
    to?: string
    type?: TxType
    accountId?: string
    categoryId?: string
    q?: string
  }
  accounts: CashAccount[]
  categories: TransactionCategory[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: typeof props.modelValue] }>()

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function setPreset(preset: 'this-month' | 'last-month' | 'this-year' | 'all') {
  const now = new Date()
  if (preset === 'this-month') {
    value.value = { ...value.value, from: firstOfMonthIso(now), to: todayIso() }
  } else if (preset === 'last-month') {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    const y = prev.getFullYear()
    const m = String(prev.getMonth() + 1).padStart(2, '0')
    const ld = String(lastDay.getDate()).padStart(2, '0')
    value.value = { ...value.value, from: `${y}-${m}-01`, to: `${y}-${m}-${ld}` }
  } else if (preset === 'this-year') {
    const y = now.getFullYear()
    value.value = { ...value.value, from: `${y}-01-01`, to: todayIso() }
  } else {
    const next = { ...value.value }
    delete next.from
    delete next.to
    value.value = next
  }
}

function reset() {
  emit('update:modelValue', {})
}

const inputCls =
  'h-9 px-2.5 border border-cms-border rounded-cms bg-cms-surface text-sm text-cms-ink outline-none focus:border-cms-green-700'
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-4 mb-4">
    <div class="flex flex-wrap items-end gap-3">
      <div>
        <div class="text-[11px] text-cms-muted uppercase tracking-[0.3px] mb-1 font-semibold">Periode</div>
        <div class="flex gap-1.5">
          <AdminBtn size="sm" variant="ghost" @click="setPreset('this-month')">Bulan ini</AdminBtn>
          <AdminBtn size="sm" variant="ghost" @click="setPreset('last-month')">Bulan lalu</AdminBtn>
          <AdminBtn size="sm" variant="ghost" @click="setPreset('this-year')">Tahun ini</AdminBtn>
          <AdminBtn size="sm" variant="ghost" @click="setPreset('all')">Semua</AdminBtn>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input
          type="date"
          :value="value.from ?? ''"
          :class="inputCls"
          @input="(e) => (value = { ...value, from: (e.target as HTMLInputElement).value || undefined })"
        >
        <span class="text-cms-muted text-sm">—</span>
        <input
          type="date"
          :value="value.to ?? ''"
          :class="inputCls"
          @input="(e) => (value = { ...value, to: (e.target as HTMLInputElement).value || undefined })"
        >
      </div>
      <select
        :value="value.type ?? ''"
        :class="inputCls"
        @change="(e) => (value = { ...value, type: (e.target as HTMLSelectElement).value as TxType || undefined })"
      >
        <option value="">Semua tipe</option>
        <option value="income">Pemasukan</option>
        <option value="expense">Pengeluaran</option>
        <option value="transfer">Transfer</option>
      </select>
      <select
        :value="value.accountId ?? ''"
        :class="inputCls"
        @change="(e) => (value = { ...value, accountId: (e.target as HTMLSelectElement).value || undefined })"
      >
        <option value="">Semua akun</option>
        <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
      <select
        :value="value.categoryId ?? ''"
        :class="inputCls"
        @change="(e) => (value = { ...value, categoryId: (e.target as HTMLSelectElement).value || undefined })"
      >
        <option value="">Semua kategori</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">
          {{ c.parentId ? '— ' : '' }}{{ c.name }}
        </option>
      </select>
      <input
        type="search"
        placeholder="Cari deskripsi…"
        :value="value.q ?? ''"
        :class="[inputCls, 'min-w-[200px]']"
        @input="(e) => (value = { ...value, q: (e.target as HTMLInputElement).value || undefined })"
      >
      <AdminBtn size="sm" variant="ghost" @click="reset">
        <Icon name="lucide:x" size="14" /> Reset
      </AdminBtn>
    </div>
  </div>
</template>
