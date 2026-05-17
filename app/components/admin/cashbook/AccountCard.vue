<script setup lang="ts">
import type { CashAccount } from '~/composables/useCashbook'
import { accountTypeIcon, accountTypeLabel, formatRupiah } from '~/utils/format'

defineProps<{ account: CashAccount }>()
defineEmits<{ edit: [id: string]; archive: [id: string] }>()
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-5 flex flex-col">
    <div class="flex items-start gap-3">
      <div class="w-12 h-12 rounded-[12px] bg-cms-green-100 text-cms-green-700 grid place-items-center shrink-0">
        <Icon :name="accountTypeIcon(account.type)" size="22" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-semibold text-cms-ink truncate">{{ account.name }}</div>
        <div class="text-[12px] text-cms-muted">{{ accountTypeLabel(account.type) }}</div>
        <div v-if="account.accountNumber" class="text-[12.5px] text-cms-ink-2 mt-0.5 font-mono">
          {{ account.accountNumber }}
        </div>
      </div>
      <span
        v-if="!account.isActive"
        class="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-cms-surface-2 text-cms-muted border border-cms-border"
      >
        Arsip
      </span>
    </div>

    <div class="mt-4">
      <div class="text-[11.5px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Saldo</div>
      <div class="font-serif text-[24px] font-semibold mt-0.5">{{ formatRupiah(account.balance) }}</div>
      <div class="text-[11.5px] text-cms-muted mt-0.5">
        Saldo awal: {{ formatRupiah(account.openingBalance) }}
      </div>
    </div>

    <div class="flex justify-end gap-1 mt-4 pt-3 border-t border-cms-border">
      <AdminBtn size="sm" variant="ghost" @click="$emit('edit', account.id)">
        <Icon name="lucide:edit-2" size="14" /> Edit
      </AdminBtn>
      <AdminBtn size="sm" variant="ghost" @click="$emit('archive', account.id)">
        <Icon name="lucide:archive" size="14" /> Arsip
      </AdminBtn>
    </div>
  </div>
</template>
