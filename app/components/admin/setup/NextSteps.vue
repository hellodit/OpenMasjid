<script setup lang="ts">
/** "What next" cards shown at the end of the setup wizard. */
const props = defineProps<{
  checklist?: { event: boolean, announcement: boolean, duty: boolean, team: boolean } | null
}>()

const tp = useTenantPath()
const { isOwner } = useAuth()

const cards = computed(() => [
  { id: 'event', title: 'Buat kegiatan', text: 'Kajian, pengajian, atau acara dengan pendaftaran jamaah.', icon: 'lucide:calendar-plus', to: tp('/admin/events/new'), done: props.checklist?.event },
  { id: 'announcement', title: 'Buat pengumuman', text: 'Tampil di halaman masjid dan Layar TV.', icon: 'lucide:megaphone', to: tp('/admin/announcements'), done: props.checklist?.announcement },
  { id: 'duty', title: 'Isi jadwal petugas', text: 'Imam, khatib, muadzin, dan bilal.', icon: 'lucide:user-round-check', to: tp('/admin/duties'), done: props.checklist?.duty },
  ...(isOwner.value
    ? [{ id: 'team', title: 'Undang pengurus', text: 'Ajak pengurus DKM lain mengelola masjid.', icon: 'lucide:user-plus', to: tp('/admin/team'), done: props.checklist?.team }]
    : []),
  { id: 'display', title: 'Buka Layar TV', text: 'Jadwal sholat & pengumuman untuk layar di masjid.', icon: 'lucide:monitor', to: tp('/display'), done: false, external: true },
])
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <NuxtLink
      v-for="c in cards"
      :key="c.id"
      :to="c.to"
      :target="c.external ? '_blank' : undefined"
      class="group flex items-start gap-3 border border-cms-border rounded-cms px-4 py-3.5 bg-cms-surface hover:border-cms-green-300 hover:bg-cms-green-50 transition-colors"
    >
      <span class="w-9 h-9 rounded-[10px] bg-cms-green-50 text-cms-green-700 grid place-items-center shrink-0 group-hover:bg-cms-surface">
        <Icon :name="c.icon" size="18" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-2 font-semibold text-[14px] text-cms-ink">
          {{ c.title }}
          <UBadge v-if="c.done" color="success" variant="subtle" size="sm" label="Sudah" />
        </span>
        <span class="block text-[12.5px] text-cms-muted mt-0.5">{{ c.text }}</span>
      </span>
      <Icon :name="c.external ? 'lucide:external-link' : 'lucide:arrow-right'" size="16" class="text-cms-muted mt-1 shrink-0" />
    </NuxtLink>
  </div>
</template>
