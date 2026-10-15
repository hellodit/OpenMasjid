<script setup lang="ts">
import { firstOfMonthIso, todayIso } from '~/utils/format'
import type { SelectMenuItem } from '@nuxt/ui'
import {
  categoriesAsTree,
  type CashAccount,
  type TransactionCategory,
  type TxType,
} from '~/composables/useCashbook'

export interface TransactionFilterValue {
  from?: string
  to?: string
  type?: TxType
  accountId?: string
  categoryId?: string
  q?: string
}

const props = defineProps<{
  modelValue: TransactionFilterValue
  accounts: CashAccount[]
  categories: TransactionCategory[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: TransactionFilterValue] }>()

function patch(next: Partial<TransactionFilterValue>) {
  // Drop empty values so they don't end up in the query string.
  const merged = Object.fromEntries(
    Object.entries({ ...props.modelValue, ...next }).filter(([, v]) => v !== '' && v !== null && v !== undefined),
  ) as TransactionFilterValue
  emit('update:modelValue', merged)
}

const typeItems = [
  { label: 'Pemasukan', value: 'income', icon: 'i-lucide-arrow-down-circle' },
  { label: 'Pengeluaran', value: 'expense', icon: 'i-lucide-arrow-up-circle' },
  { label: 'Transfer', value: 'transfer', icon: 'i-lucide-repeat' },
] satisfies SelectMenuItem[]

const accountItems = computed(() =>
  props.accounts.map((a) => ({ label: a.isActive ? a.name : `${a.name} (arsip)`, value: a.id })),
)

const categoryItems = computed<SelectMenuItem[][]>(() => {
  const types: Array<'income' | 'expense'> = props.modelValue.type === 'income' || props.modelValue.type === 'expense'
    ? [props.modelValue.type]
    : ['income', 'expense']
  return types.flatMap((t) =>
    categoriesAsTree(props.categories.filter((c) => c.type === t)).map((parent) => [
      { label: parent.name, value: parent.id },
      ...parent.children.map((c) => ({ label: c.name, value: c.id, class: 'ps-6' })),
    ]),
  )
})

// Debounce free-text search so each keystroke doesn't refetch.
const search = ref(props.modelValue.q ?? '')
watch(() => props.modelValue.q, (q) => { if ((q ?? '') !== search.value) search.value = q ?? '' })
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, (q) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => patch({ q: q.trim() || undefined }), 300)
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function setPreset(preset: 'this-month' | 'last-month' | 'this-year' | 'all') {
  const now = new Date()
  if (preset === 'this-month') {
    patch({ from: firstOfMonthIso(now), to: todayIso() })
  } else if (preset === 'last-month') {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    const ym = `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}`
    patch({ from: `${ym}-01`, to: `${ym}-${pad(lastDay.getDate())}` })
  } else if (preset === 'this-year') {
    patch({ from: `${now.getFullYear()}-01-01`, to: todayIso() })
  } else {
    patch({ from: undefined, to: undefined })
  }
}

const hasFilters = computed(() => Object.keys(props.modelValue).length > 0)

function reset() {
  search.value = ''
  emit('update:modelValue', {})
}
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-4 mb-4">
    <div class="flex flex-wrap items-end gap-3">
      <div>
        <div class="text-[11px] text-cms-muted uppercase tracking-[0.3px] mb-1 font-semibold">Periode</div>
        <div class="flex gap-1.5">
          <UButton size="sm" color="neutral" variant="ghost" label="Bulan ini" @click="setPreset('this-month')" />
          <UButton size="sm" color="neutral" variant="ghost" label="Bulan lalu" @click="setPreset('last-month')" />
          <UButton size="sm" color="neutral" variant="ghost" label="Tahun ini" @click="setPreset('this-year')" />
          <UButton size="sm" color="neutral" variant="ghost" label="Semua" @click="setPreset('all')" />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UInput
          type="date"
          aria-label="Dari tanggal"
          :model-value="modelValue.from ?? ''"
          @update:model-value="(v) => patch({ from: String(v) || undefined })"
        />
        <span class="text-cms-muted text-sm">—</span>
        <UInput
          type="date"
          aria-label="Sampai tanggal"
          :model-value="modelValue.to ?? ''"
          @update:model-value="(v) => patch({ to: String(v) || undefined })"
        />
      </div>
      <USelectMenu
        :model-value="modelValue.type"
        :items="typeItems"
        value-key="value"
        :search-input="false"
        clear
        placeholder="Semua tipe"
        class="w-44"
        @update:model-value="(v) => patch({ type: (v ?? undefined) as TxType | undefined, categoryId: v === 'transfer' ? undefined : modelValue.categoryId })"
      />
      <USelectMenu
        :model-value="modelValue.accountId"
        :items="accountItems"
        value-key="value"
        clear
        placeholder="Semua akun"
        class="w-48"
        @update:model-value="(v) => patch({ accountId: v ?? undefined })"
      />
      <USelectMenu
        v-if="modelValue.type !== 'transfer'"
        :model-value="modelValue.categoryId"
        :items="categoryItems"
        value-key="value"
        clear
        placeholder="Semua kategori"
        class="w-52"
        @update:model-value="(v) => patch({ categoryId: v ?? undefined })"
      />
      <UInput
        v-model="search"
        type="search"
        icon="i-lucide-search"
        placeholder="Cari deskripsi…"
        class="min-w-[200px]"
      />
      <UButton
        v-if="hasFilters"
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        label="Reset"
        @click="reset"
      />
    </div>
  </div>
</template>
