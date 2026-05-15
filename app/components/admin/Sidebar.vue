<script setup lang="ts">
const route = useRoute()
const { EVENTS } = useAdminMock()

interface NavItem {
  id: string
  name: string
  icon: string
  path?: string
  count?: number
  matches?: string[]
}

const manage: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: 'lucide:layout-grid', path: '/admin' },
  { id: 'kegiatan',  name: 'Kegiatan',  icon: 'lucide:calendar',
    path: '/admin/kegiatan', count: EVENTS.length,
    matches: ['/admin/kegiatan'] },
  { id: 'kategori',  name: 'Kategori',  icon: 'lucide:tag', path: '/admin/kategori' },
  { id: 'pendaftar', name: 'Pendaftar', icon: 'lucide:users', path: '/admin/pendaftar', count: 142 },
  { id: 'materi',    name: 'Materi Kajian', icon: 'lucide:book-open' },
]

const system: NavItem[] = [
  { id: 'pengaturan', name: 'Pengaturan',   icon: 'lucide:settings', path: '/admin/pengaturan' },
  { id: 'notif',      name: 'Pemberitahuan', icon: 'lucide:bell', count: 3 },
]

const isActive = (item: NavItem) => {
  if (!item.path) return false
  if (item.id === 'dashboard') return route.path === '/admin'
  if (item.matches?.length) return item.matches.some(m => route.path.startsWith(m))
  return route.path === item.path || route.path.startsWith(item.path + '/')
}
</script>

<template>
  <aside
    class="flex flex-col bg-cms-green-900 text-[oklch(0.95_0.015_155)] border-r border-cms-green-800 overflow-hidden"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 py-[18px] pt-[22px] border-b border-[oklch(0.32_0.05_155)]">
      <div class="w-[38px] h-[38px] rounded-[10px] bg-cms-gold grid place-items-center text-cms-green-900 shrink-0">
        <AdminStarMark :size="22" />
      </div>
      <div>
        <div class="font-serif text-[18px] font-semibold leading-[1.1] tracking-[0.2px]">
          Masjidku
        </div>
        <div class="text-[11px] uppercase tracking-[1px] text-[oklch(0.78_0.04_155)] mt-0.5">
          Event Management
        </div>
      </div>
    </div>

    <div class="px-5 pt-[18px] pb-2 text-[11px] uppercase tracking-[1.2px] text-[oklch(0.70_0.04_155)] font-semibold">
      Manajemen
    </div>
    <nav class="cms-sidebar-nav flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
      <NuxtLink
        v-for="it in manage"
        :key="it.id"
        :to="it.path ?? '#'"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-cms-sm text-sm font-medium text-left transition-colors',
          isActive(it)
            ? 'bg-cms-green-700 text-white shadow-[inset_0_0_0_1px_oklch(0.50_0.10_155)]'
            : 'text-[oklch(0.85_0.025_155)] hover:bg-[oklch(0.34_0.07_155)] hover:text-white',
        ]"
      >
        <Icon :name="it.icon" size="18" class="shrink-0 opacity-90" />
        <span class="flex-1">{{ it.name }}</span>
        <span
          v-if="it.count != null"
          :class="[
            'text-[11px] px-1.5 py-0.5 rounded-[10px] font-semibold',
            isActive(it) ? 'bg-cms-gold text-cms-green-900' : 'bg-[oklch(0.40_0.08_155)] text-white',
          ]"
        >
          {{ it.count }}
        </span>
      </NuxtLink>
    </nav>

    <div class="px-5 pt-[18px] pb-2 text-[11px] uppercase tracking-[1.2px] text-[oklch(0.70_0.04_155)] font-semibold">
      Sistem
    </div>
    <nav class="flex flex-col gap-0.5 px-3 mb-3">
      <NuxtLink
        v-for="it in system"
        :key="it.id"
        :to="it.path ?? '#'"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-cms-sm text-sm font-medium text-left transition-colors',
          isActive(it)
            ? 'bg-cms-green-700 text-white shadow-[inset_0_0_0_1px_oklch(0.50_0.10_155)]'
            : 'text-[oklch(0.85_0.025_155)] hover:bg-[oklch(0.34_0.07_155)] hover:text-white',
        ]"
      >
        <Icon :name="it.icon" size="18" class="shrink-0 opacity-90" />
        <span class="flex-1">{{ it.name }}</span>
        <span
          v-if="it.count != null"
          :class="[
            'text-[11px] px-1.5 py-0.5 rounded-[10px] font-semibold',
            isActive(it) ? 'bg-cms-gold text-cms-green-900' : 'bg-[oklch(0.40_0.08_155)] text-white',
          ]"
        >
          {{ it.count }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="flex items-center gap-2.5 px-4 py-3.5 border-t border-[oklch(0.32_0.05_155)]">
      <div class="w-9 h-9 rounded-full bg-cms-green-600 grid place-items-center text-white font-semibold text-[13px] shrink-0">
        SH
      </div>
      <div class="leading-[1.25] min-w-0">
        <div class="font-semibold text-[13px] text-white">H. Sulaiman</div>
        <div class="text-[11px] text-[oklch(0.72_0.03_155)]">Ketua DKM</div>
      </div>
    </div>
  </aside>
</template>
