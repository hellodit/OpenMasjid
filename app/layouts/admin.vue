<script setup lang="ts">
const route = useRoute()

const crumbs = computed<string[]>(() => {
  const p = route.path
  if (p === '/admin') return ['Manajemen', 'Dashboard']
  if (p.startsWith('/admin/events/new')) return ['Manajemen', 'Kegiatan', 'Tambah']
  if (/^\/admin\/events\/[^/]+$/.test(p)) return ['Manajemen', 'Kegiatan', 'Detail']
  if (p.startsWith('/admin/events')) return ['Manajemen', 'Kegiatan']
  if (p.startsWith('/admin/categories')) return ['Manajemen', 'Kategori']
  if (p.startsWith('/admin/registrants')) return ['Manajemen', 'Pendaftar']
  if (p.startsWith('/admin/settings')) return ['Sistem', 'Pengaturan']
  return ['Manajemen']
})

useHead({
  htmlAttrs: { lang: 'id' },
  bodyAttrs: { class: 'bg-cms-bg text-cms-ink font-sans antialiased' },
})
</script>

<template>
  <div class="grid grid-cols-[256px_1fr] h-screen overflow-hidden">
    <AdminSidebar />
    <main class="flex flex-col bg-cms-bg overflow-hidden relative">
      <AdminTopbar :crumbs="crumbs" />
      <div class="flex-1 overflow-y-auto p-7">
        <div class="max-w-[1180px] mx-auto">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
