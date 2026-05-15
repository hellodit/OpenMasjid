<script setup lang="ts">
defineProps<{ crumbs: string[] }>()
</script>

<template>
  <div class="flex items-center gap-4 h-16 px-7 border-b border-cms-border bg-cms-surface shrink-0">
    <div class="flex items-center gap-2 text-[13px] text-cms-muted">
      <template v-for="(c, i) in crumbs" :key="i">
        <span :class="i === crumbs.length - 1 ? 'text-cms-ink font-semibold' : ''">{{ c }}</span>
        <Icon v-if="i < crumbs.length - 1" name="lucide:chevron-right" size="14" class="opacity-50" />
      </template>
    </div>

    <div class="ml-auto relative w-[320px]">
      <Icon name="lucide:search" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-cms-muted" />
      <input
        type="text"
        placeholder="Cari kegiatan, jamaah, kategori…"
        class="cms-input w-full h-[38px] rounded-cms border border-cms-border bg-cms-surface-2 pl-10 pr-3.5 text-[13px] outline-none transition-colors focus:bg-cms-surface"
      >
    </div>

    <button
      type="button"
      class="relative w-[38px] h-[38px] rounded-cms border border-cms-border bg-cms-surface grid place-items-center text-cms-ink-2 hover:bg-cms-surface-2 hover:border-cms-border-strong transition-colors"
      title="Notifikasi"
    >
      <Icon name="lucide:bell" size="18" />
      <span class="absolute top-2 right-2 w-[7px] h-[7px] bg-cms-gold rounded-full border-2 border-cms-surface" />
    </button>
    <button
      type="button"
      class="w-[38px] h-[38px] rounded-cms border border-cms-border bg-cms-surface grid place-items-center text-cms-ink-2 hover:bg-cms-surface-2 hover:border-cms-border-strong transition-colors"
      title="Pengaturan"
    >
      <Icon name="lucide:settings" size="18" />
    </button>
  </div>
</template>
