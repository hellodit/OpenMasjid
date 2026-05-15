<script setup lang="ts">
import { initials, type Attendee } from '~/composables/useAdminMock'

defineProps<{ items: Attendee[] }>()
</script>

<template>
  <div>
    <div
      v-for="(a, i) in items"
      :key="i"
      :class="['flex items-center gap-2.5 py-2', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div class="w-8 h-8 rounded-full bg-cms-green-100 text-cms-green-800 grid place-items-center font-semibold text-[12px] shrink-0">
        {{ initials(a.name) }}
      </div>
      <div>
        <div class="font-semibold text-[13px]">{{ a.name }}</div>
        <div class="text-[11.5px] text-cms-muted">{{ a.email }}</div>
      </div>
      <div class="ml-auto text-[11px] text-cms-muted">{{ a.when }}</div>
    </div>
  </div>
</template>
