<script setup lang="ts">
const tp = useTenantPath()
defineProps<{ crumbs: string[] }>()
defineEmits<{ 'open-menu': [] }>()
</script>

<template>
  <div class="flex items-center gap-3 lg:gap-4 h-14 lg:h-16 px-3 sm:px-5 lg:px-7 border-b border-cms-border bg-cms-surface shrink-0">
    <UButton
      class="lg:hidden shrink-0"
      color="neutral"
      variant="ghost"
      icon="i-lucide-menu"
      aria-label="Buka menu"
      @click="$emit('open-menu')"
    />
    <div class="flex items-center gap-2 text-[13px] text-cms-muted min-w-0">
      <template v-for="(c, i) in crumbs" :key="i">
        <span
          :class="[
            i === crumbs.length - 1 ? 'text-cms-ink font-semibold truncate' : 'hidden sm:inline shrink-0',
          ]"
        >{{ c }}</span>
        <Icon v-if="i < crumbs.length - 1" name="lucide:chevron-right" size="14" class="opacity-50 hidden sm:inline shrink-0" />
      </template>
    </div>

    <div class="ml-auto flex items-center gap-2 shrink-0">
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
