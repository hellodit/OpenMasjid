<script setup lang="ts">
import { initials, timeAgo } from '~/utils/format'
defineProps<{
  items: {
    id: string
    registeredAt: string | Date
    attendedAt: string | Date | null
    user: { fullName: string, email: string } | null
  }[]
}>()
</script>

<template>
  <div>
    <div v-if="!items.length" class="text-[13px] text-cms-muted py-2">Belum ada pendaftar.</div>
    <div
      v-for="(a, i) in items"
      :key="a.id"
      :class="['flex items-center gap-2.5 py-2', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div class="w-8 h-8 rounded-full bg-cms-green-100 text-cms-green-800 grid place-items-center font-semibold text-[12px] shrink-0">
        {{ initials(a.user?.fullName ?? '?') }}
      </div>
      <div class="min-w-0">
        <div class="font-semibold text-[13px] truncate">{{ a.user?.fullName ?? 'Pengguna dihapus' }}</div>
        <div class="text-[11.5px] text-cms-muted truncate">{{ a.user?.email }}</div>
      </div>
      <div class="ml-auto text-right shrink-0">
        <UBadge v-if="a.attendedAt" color="primary" variant="subtle" size="sm">Hadir</UBadge>
        <div class="text-[11px] text-cms-muted">{{ timeAgo(a.registeredAt) }}</div>
      </div>
    </div>
  </div>
</template>
