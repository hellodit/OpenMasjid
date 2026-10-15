<script setup lang="ts">
/** Dashboard card "Lengkapi profil masjid", driven by GET admin/setup. Admins only. */
const api = useApiBase()
const tp = useTenantPath()
const slug = useTenantSlug()
const { isOwner } = useAuth()

const { data } = await useFetch(`${api}/admin/setup`)

const storageKey = computed(() => `om:setup-checklist-hidden:${slug.value}`)
const hidden = ref(false)
onMounted(() => {
  try {
    hidden.value = localStorage.getItem(storageKey.value) === '1'
  }
  catch {
    // storage unavailable: keep the card visible
  }
})
function hide() {
  hidden.value = true
  try {
    localStorage.setItem(storageKey.value, '1')
  }
  catch {
    // storage unavailable: hidden for this page view only
  }
}

const items = computed(() => {
  const c = data.value?.checklist
  if (!c) return []
  return [
    { id: 'location', label: 'Lokasi & zona waktu', done: c.location, to: tp('/admin/setup') },
    { id: 'address', label: 'Alamat masjid', done: c.address, to: tp('/admin/setup?step=2') },
    { id: 'contact', label: 'Kontak (telepon/WA/email)', done: c.contact, to: tp('/admin/setup?step=2') },
    { id: 'event', label: 'Kegiatan pertama', done: c.event, to: tp('/admin/events/new') },
    { id: 'announcement', label: 'Pengumuman', done: c.announcement, to: tp('/admin/announcements') },
    { id: 'duty', label: 'Jadwal petugas', done: c.duty, to: tp('/admin/duties') },
    { id: 'team', label: 'Undang pengurus', done: c.team, to: isOwner.value ? tp('/admin/team') : undefined },
  ]
})
const doneCount = computed(() => items.value.filter(i => i.done).length)
const visible = computed(() => !hidden.value && items.value.length > 0 && doneCount.value < items.value.length)
const percent = computed(() => Math.round((doneCount.value / Math.max(items.value.length, 1)) * 100))
</script>

<template>
  <div
    v-if="visible"
    class="bg-cms-surface border border-cms-border rounded-cms-lg p-5 sm:p-6 mb-6"
  >
    <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div class="min-w-0">
        <h3 class="font-serif text-[18px] m-0 font-semibold">Lengkapi profil masjid</h3>
        <p class="text-cms-muted text-[13px] m-0 mt-0.5">
          {{ doneCount }} dari {{ items.length }} langkah selesai. Lengkapi agar halaman masjid dan Layar TV siap dipakai jamaah.
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <UButton
          v-if="!data?.completedAt"
          :to="tp('/admin/setup')"
          icon="i-lucide-wand-sparkles"
          label="Lanjutkan pengaturan awal"
          size="sm"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-eye-off"
          label="Sembunyikan"
          @click="hide"
        />
      </div>
    </div>

    <UProgress :model-value="percent" size="sm" class="mb-4" :aria-label="`${doneCount} dari ${items.length} selesai`" />

    <ul class="m-0 p-0 list-none grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="it in items" :key="it.id">
        <component
          :is="it.to && !it.done ? resolveComponent('NuxtLink') : 'div'"
          :to="it.to && !it.done ? it.to : undefined"
          :class="[
            'flex items-center gap-2.5 px-3 py-2.5 rounded-cms-sm border text-[13px] transition-colors',
            it.done
              ? 'border-cms-green-100 bg-cms-green-50 text-cms-ink-2'
              : it.to
                ? 'border-cms-border bg-cms-surface hover:border-cms-green-300 hover:bg-cms-green-50 text-cms-ink font-medium'
                : 'border-cms-border bg-cms-surface text-cms-muted',
          ]"
        >
          <Icon
            :name="it.done ? 'lucide:circle-check' : 'lucide:circle-dashed'"
            size="17"
            :class="it.done ? 'text-cms-green-600 shrink-0' : 'text-cms-muted-2 shrink-0'"
          />
          <span :class="['flex-1 min-w-0 truncate', it.done ? 'line-through decoration-cms-muted-2' : '']">{{ it.label }}</span>
          <Icon v-if="it.to && !it.done" name="lucide:arrow-right" size="14" class="text-cms-muted shrink-0" />
        </component>
      </li>
    </ul>
  </div>
</template>
