<script setup lang="ts">
const route = useRoute()
const slug = useTenantSlug()

const crumbs = computed<string[]>(() => {
  // Path relative to the mosque: /al-hikmah/admin/events → /admin/events
  const p = route.path.slice(`/${slug.value}`.length) || '/'
  if (p === '/admin') return ['Manajemen', 'Dashboard']
  if (p.startsWith('/admin/events/new')) return ['Manajemen', 'Kegiatan', 'Tambah']
  if (/^\/admin\/events\/[^/]+\/edit$/.test(p)) return ['Manajemen', 'Kegiatan', 'Ubah']
  if (/^\/admin\/events\/[^/]+$/.test(p)) return ['Manajemen', 'Kegiatan', 'Detail']
  if (p.startsWith('/admin/events')) return ['Manajemen', 'Kegiatan']
  if (p.startsWith('/admin/categories')) return ['Manajemen', 'Kategori']
  if (p.startsWith('/admin/registrants')) return ['Manajemen', 'Pendaftar']
  if (p.startsWith('/admin/check-in')) return ['Manajemen', 'Check-in']
  if (p.startsWith('/admin/announcements')) return ['Manajemen', 'Pengumuman']
  if (p.startsWith('/admin/duties')) return ['Manajemen', 'Jadwal Petugas']
  if (p.startsWith('/admin/setup')) return ['Sistem', 'Lengkapi Profil']
  if (p.startsWith('/admin/cashbook/transactions')) return ['Buku Kas', 'Transaksi']
  if (p.startsWith('/admin/cashbook/accounts')) return ['Buku Kas', 'Akun Kas']
  if (p.startsWith('/admin/cashbook/categories')) return ['Buku Kas', 'Kategori']
  if (p.startsWith('/admin/cashbook/reports')) return ['Buku Kas', 'Laporan']
  if (p.startsWith('/admin/cashbook')) return ['Buku Kas', 'Ringkasan']
  if (p.startsWith('/admin/settings')) return ['Sistem', 'Pengaturan']
  if (p.startsWith('/admin/team')) return ['Sistem', 'Pengurus']
  return ['Manajemen']
})

/* Below lg the sidebar lives in a slide-over opened from the topbar. */
const menuOpen = ref(false)
watch(() => route.fullPath, () => {
  menuOpen.value = false
})

useHead({
  htmlAttrs: { lang: 'id' },
  bodyAttrs: { class: 'bg-cms-bg text-cms-ink font-sans antialiased' },
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[256px_1fr] h-dvh overflow-hidden">
    <div class="hidden lg:block min-h-0">
      <AdminSidebar class="h-full" />
    </div>
    <USlideover
      v-model:open="menuOpen"
      side="left"
      title="Menu"
      description="Navigasi CMS masjid"
      :ui="{ content: 'max-w-[280px]' }"
    >
      <template #content>
        <AdminSidebar class="h-full" />
      </template>
    </USlideover>
    <main class="flex flex-col bg-cms-bg overflow-hidden relative min-w-0">
      <AdminTopbar :crumbs="crumbs" @open-menu="menuOpen = true" />
      <div class="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-7">
        <div class="max-w-[1180px] mx-auto">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
