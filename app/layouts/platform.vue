<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  bodyAttrs: { class: 'bg-cms-bg text-cms-ink font-sans antialiased' },
})

const route = useRoute()
const year = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-cms-surface-2">
    <header class="border-b border-cms-border bg-cms-surface/90 backdrop-blur sticky top-0 z-20">
      <div class="mx-auto max-w-[1120px] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-3 min-w-0">
          <div class="w-[38px] h-[38px] rounded-[10px] bg-cms-green-700 grid place-items-center text-white shrink-0">
            <AdminStarMark :size="22" />
          </div>
          <div class="min-w-0">
            <div class="font-serif text-[18px] font-semibold leading-[1.1] text-cms-ink">
              OpenMasjid
            </div>
            <div class="text-[10.5px] uppercase tracking-[1.2px] text-cms-muted mt-0.5 truncate">
              Platform manajemen masjid
            </div>
          </div>
        </NuxtLink>

        <UButton
          v-if="route.path !== '/daftar'"
          to="/daftar"
          icon="i-lucide-plus"
          label="Daftarkan Masjid"
          class="shrink-0"
        />
        <UButton
          v-else
          to="/"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          label="Beranda"
          class="shrink-0"
        />
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-cms-border bg-cms-surface">
      <div class="mx-auto max-w-[1120px] px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-cms-muted">
        <span>© {{ year }} OpenMasjid. Hak cipta dilindungi.</span>
        <span class="font-arab text-[18px] text-cms-gold-ink tracking-wide">بَارَكَ اللَّهُ فِيْكُمْ</span>
      </div>
    </footer>
  </div>
</template>
