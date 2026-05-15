<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Pengaturan — Masjidku CMS' })

type Tab = 'profile' | 'prayer'
const tab = ref<Tab>('profile')
const saved = ref(false)

const save = () => {
  saved.value = true
  setTimeout(() => (saved.value = false), 2200)
}
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Sistem"
      title="Pengaturan"
      description="Atur identitas masjid dan konfigurasi jadwal sholat yang ditampilkan di TV display serta halaman jamaah."
    >
      <template #actions>
        <span
          v-if="saved"
          class="inline-flex items-center gap-1.5 text-cms-green-700 text-[13px] font-semibold"
        >
          <Icon name="lucide:check" size="14" /> Tersimpan
        </span>
        <AdminBtn>Batal</AdminBtn>
        <AdminBtn variant="primary" @click="save">
          <Icon name="lucide:check" size="16" /> Simpan Perubahan
        </AdminBtn>
      </template>
    </AdminPageHeader>

    <div class="inline-flex bg-cms-surface border border-cms-border rounded-cms p-1.5 gap-1 mb-5">
      <button
        type="button"
        :class="[
          'inline-flex items-center gap-2 h-9 px-4 text-[13.5px] font-semibold rounded-lg tracking-[0.1px] transition-colors',
          tab === 'profile' ? 'bg-cms-green-700 text-white shadow-cms-primary' : 'text-cms-ink-2 hover:bg-cms-green-50',
        ]"
        @click="tab = 'profile'"
      >
        <Icon name="lucide:building" size="16" />
        Profil Masjid
      </button>
      <button
        type="button"
        :class="[
          'inline-flex items-center gap-2 h-9 px-4 text-[13.5px] font-semibold rounded-lg tracking-[0.1px] transition-colors',
          tab === 'prayer' ? 'bg-cms-green-700 text-white shadow-cms-primary' : 'text-cms-ink-2 hover:bg-cms-green-50',
        ]"
        @click="tab = 'prayer'"
      >
        <Icon name="lucide:clock" size="16" />
        Waktu Sholat
      </button>
    </div>

    <AdminSettingsMosqueProfile v-if="tab === 'profile'" />
    <AdminSettingsPrayerTimes   v-else />
  </div>
</template>
