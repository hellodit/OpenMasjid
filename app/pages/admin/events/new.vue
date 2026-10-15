<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Tambah Kegiatan — OpenMasjid CMS' })

const { isAdmin } = useAuth()
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Kegiatan Baru"
      title="Tambah Kegiatan"
      description="Lengkapi informasi kegiatan agar jamaah dapat mengetahui dan mendaftar dengan mudah."
    >
      <template #actions>
        <UButton to="/admin/events" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="font-semibold">
          Kembali ke Daftar
        </UButton>
      </template>
    </AdminPageHeader>

    <AdminFormEventForm v-if="isAdmin" />
    <UAlert
      v-else
      color="warning"
      variant="subtle"
      icon="i-lucide-lock"
      title="Akses terbatas"
      description="Hanya admin yang dapat menambah kegiatan."
    />
  </div>
</template>
