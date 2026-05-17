<script setup lang="ts">
import { formatRupiah, accountTypeIcon } from '~/utils/format'
import type { CashAccount } from '~/composables/useCashbook'

defineProps<{
  totalBalance: string
  accounts: CashAccount[]
  compact?: boolean
}>()
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6">
    <div class="text-[12px] uppercase tracking-[0.4px] text-cms-muted font-semibold">
      Total Saldo Kas
    </div>
    <div class="font-serif text-[36px] font-semibold mt-1 text-cms-green-800">
      {{ formatRupiah(totalBalance) }}
    </div>

    <div
      v-if="!compact && accounts.length"
      class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <div
        v-for="a in accounts"
        :key="a.id"
        class="flex items-center gap-3 rounded-cms border border-cms-border bg-cms-surface-2 px-3 py-2.5"
      >
        <div class="w-9 h-9 rounded-[10px] bg-cms-green-100 text-cms-green-700 grid place-items-center shrink-0">
          <Icon :name="accountTypeIcon(a.type)" size="18" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-[13px] font-semibold truncate">{{ a.name }}</div>
          <div v-if="a.accountNumber" class="text-[11.5px] text-cms-muted truncate">
            {{ a.accountNumber }}
          </div>
        </div>
        <div class="font-semibold text-sm text-cms-ink whitespace-nowrap">
          {{ formatRupiah(a.balance) }}
        </div>
      </div>
    </div>
  </div>
</template>
