<script setup lang="ts">
definePageMeta({ layout: false })

const api = useApiBase()
const tp = useTenantPath()
const { tenant } = useTenantContext()

useHead({
  title: () => `Pengumuman — ${tenant.value?.name ?? 'OpenMasjid'}`,
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#1f3b2d' },
    { name: 'description', content: () => `Pengumuman terbaru dari ${tenant.value?.name ?? 'masjid'}.` },
  ],
})

const { data, pending, error } = await useFetch(`${api}/public/announcements`, {
  key: 'portal-announcements-all',
  query: { limit: 50 },
})
</script>

<template>
  <div class="min-h-screen bg-cms-bg text-cms-ink font-sans antialiased">
    <PortalHeader subtitle="Pengumuman" :back-to="`${tp('/')}#pengumuman`" />

    <section class="relative overflow-hidden cms-hero-grad text-white">
      <div class="absolute inset-0 cms-pattern-khatam opacity-[0.18] pointer-events-none" />
      <div class="relative mx-auto max-w-2xl px-5 pt-7 pb-8">
        <div class="text-[11px] uppercase tracking-[2px] text-cms-gold-soft font-semibold mb-2">
          Informasi jamaah
        </div>
        <h1 class="font-serif text-[26px] leading-tight font-semibold">
          Pengumuman
        </h1>
        <p class="text-[13.5px] text-white/80 mt-1.5">
          Pengumuman yang sedang berlaku di {{ tenant?.name ?? 'masjid ini' }}.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-2xl px-4 py-6 pb-12">
      <div v-if="pending && !data" class="space-y-3">
        <USkeleton v-for="i in 3" :key="i" class="h-28 rounded-cms-lg" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        title="Gagal memuat pengumuman"
        description="Muat ulang halaman atau coba lagi beberapa saat."
      />

      <div v-else-if="data?.length" class="space-y-3">
        <PortalAnnouncementCard v-for="a in data" :key="a.id" :announcement="a" />
      </div>

      <div
        v-else
        class="bg-white rounded-cms-lg border border-dashed border-cms-border px-4 py-10 text-center"
      >
        <Icon name="lucide:megaphone-off" size="22" class="text-cms-muted mx-auto mb-2" />
        <div class="text-[13.5px] font-semibold text-cms-ink-2">Belum ada pengumuman</div>
        <div class="text-[12px] text-cms-muted mt-1">
          Tidak ada pengumuman yang sedang berlaku saat ini.
        </div>
        <UButton :to="tp('/')" size="sm" color="neutral" variant="outline" icon="i-lucide-arrow-left" class="rounded-full mt-4">
          Kembali ke beranda
        </UButton>
      </div>
    </div>
  </div>
</template>
