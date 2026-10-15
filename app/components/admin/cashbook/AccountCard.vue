<script setup lang="ts">
import { accountTypeIcon, accountTypeLabel, formatRupiah } from '~/utils/format'
import type { CashAccount } from '~/composables/useCashbook'

defineProps<{ account: CashAccount; canEdit?: boolean }>()
defineEmits<{ edit: [id: string]; archive: [id: string]; restore: [id: string] }>()
</script>

<template>
  <div
    :class="[
      'bg-cms-surface border border-cms-border rounded-cms-lg p-5 flex flex-col',
      !account.isActive && 'opacity-75',
    ]"
  >
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
        <div v-if="account.holderName" class="text-[12px] text-cms-muted truncate">
          a.n. {{ account.holderName }}
        </div>
      </div>
      <UBadge v-if="!account.isActive" color="neutral" variant="outline" size="sm" label="Arsip" />
    </div>

    <div class="mt-4">
      <div class="text-[11.5px] text-cms-muted uppercase tracking-[0.3px] font-semibold">Saldo</div>
      <div class="font-serif text-[24px] font-semibold mt-0.5">{{ formatRupiah(account.balance) }}</div>
      <div class="text-[11.5px] text-cms-muted mt-0.5">
        Saldo awal: {{ formatRupiah(account.openingBalance) }}
      </div>
    </div>

    <div v-if="canEdit" class="flex justify-end gap-1 mt-4 pt-3 border-t border-cms-border">
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-pencil"
        label="Edit"
        @click="$emit('edit', account.id)"
      />
      <UButton
        v-if="account.isActive"
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-archive"
        label="Arsip"
        @click="$emit('archive', account.id)"
      />
      <UButton
        v-else
        size="sm"
        color="primary"
        variant="ghost"
        icon="i-lucide-archive-restore"
        label="Aktifkan"
        @click="$emit('restore', account.id)"
      />
    </div>
  </div>
</template>
