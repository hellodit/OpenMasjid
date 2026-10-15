<script setup lang="ts">
/** Compact sticky header for secondary portal pages (event detail, tickets). */
withDefaults(defineProps<{ subtitle?: string, backTo?: string }>(), { subtitle: 'OpenMasjid · Profil & Kegiatan', backTo: undefined })

const tp = useTenantPath()
const { tenant } = useTenantContext()
</script>

<template>
  <header class="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-cms-border">
    <div class="mx-auto max-w-2xl flex items-center gap-3 px-4 py-3">
      <UButton
        :to="backTo ?? tp('/')"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-arrow-left"
        class="shrink-0 -ml-2"
        aria-label="Kembali"
      />
      <NuxtLink :to="tp('/')" class="flex items-center gap-3 min-w-0 flex-1">
        <div class="w-9 h-9 rounded-[10px] bg-cms-green-800 grid place-items-center text-cms-gold shrink-0">
          <AdminStarMark :size="20" />
        </div>
        <div class="min-w-0">
          <div class="font-serif text-[15px] font-semibold leading-tight truncate">
            {{ tenant?.name ?? 'OpenMasjid' }}
          </div>
          <div class="text-[11px] text-cms-muted truncate">
            {{ subtitle }}
          </div>
        </div>
      </NuxtLink>
      <PortalAuthMenu />
    </div>
  </header>
</template>
