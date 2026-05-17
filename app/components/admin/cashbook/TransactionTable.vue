<script setup lang="ts">
import { formatDate, formatRupiah, transactionTypeLabel } from '~/utils/format'
import type { TransactionListItem } from '~/composables/useCashbook'

defineProps<{
  rows: TransactionListItem[]
  loading?: boolean
  emptyMessage?: string
}>()

defineEmits<{ open: [id: string] }>()
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-cms-surface-2 text-cms-muted text-[12px] uppercase tracking-[0.4px]">
        <tr>
          <th class="text-left font-semibold px-4 py-2.5">Tanggal</th>
          <th class="text-left font-semibold px-4 py-2.5">Tipe</th>
          <th class="text-left font-semibold px-4 py-2.5">Kategori / Tujuan</th>
          <th class="text-left font-semibold px-4 py-2.5">Deskripsi</th>
          <th class="text-left font-semibold px-4 py-2.5">Akun</th>
          <th class="text-right font-semibold px-4 py-2.5">Nominal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="6" class="px-4 py-8 text-center text-cms-muted">Memuat…</td>
        </tr>
        <tr v-else-if="!rows.length">
          <td colspan="6" class="px-4 py-8 text-center text-cms-muted">
            {{ emptyMessage ?? 'Belum ada transaksi.' }}
          </td>
        </tr>
        <tr
          v-for="r in rows"
          v-else
          :key="r.id"
          class="border-t border-cms-border hover:bg-cms-surface-2 cursor-pointer"
          @click="$emit('open', r.id)"
        >
          <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(r.transactionDate) }}</td>
          <td class="px-4 py-3 whitespace-nowrap">
            <span
              :class="[
                'inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full',
                r.type === 'income' && 'bg-cms-green-100 text-cms-green-800',
                r.type === 'expense' && 'bg-cms-rose-soft text-cms-rose',
                r.type === 'transfer' && 'bg-cms-info-soft text-cms-info',
              ]"
            >
              {{ transactionTypeLabel(r.type) }}
            </span>
          </td>
          <td class="px-4 py-3">
            <template v-if="r.type === 'transfer'">
              <span class="text-cms-muted">→ {{ r.destinationAccount?.name ?? '—' }}</span>
            </template>
            <template v-else>
              <span
                v-if="r.category"
                class="inline-flex items-center gap-1.5"
                :style="r.category.colorToken ? `color:${r.category.colorToken}` : ''"
              >
                <Icon :name="r.category.icon ?? 'lucide:tag'" size="14" />
                {{ r.category.name }}
              </span>
              <span v-else class="text-cms-muted">—</span>
            </template>
          </td>
          <td class="px-4 py-3 max-w-[280px] truncate">{{ r.description }}</td>
          <td class="px-4 py-3 whitespace-nowrap text-cms-muted">{{ r.account?.name ?? '—' }}</td>
          <td
            class="px-4 py-3 text-right font-semibold whitespace-nowrap"
            :class="[
              r.type === 'income' && 'text-cms-green-800',
              r.type === 'expense' && 'text-cms-rose',
              r.type === 'transfer' && 'text-cms-info',
            ]"
          >
            {{ r.type === 'expense' ? '−' : r.type === 'income' ? '+' : '' }}{{ formatRupiah(r.amount) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
