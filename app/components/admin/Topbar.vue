<script setup lang="ts">
const tp = useTenantPath()
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

    <div class="ml-auto flex items-center gap-2">
      <UButton
        :to="tp('/admin/settings')"
        color="neutral"
        variant="outline"
        icon="i-lucide-settings"
        aria-label="Pengaturan"
      />
    </div>
  </div>
</template>
