<script setup lang="ts">
import { eventToFormState } from '~/components/admin/form/EventForm.vue'
const api = useApiBase()
const tp = useTenantPath()

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { isAdmin } = useAuth()
const id = computed(() => String(route.params.id))

const { data: ev, error } = await useFetch(() => `${api}/admin/events/${id.value}`)
if (error.value?.statusCode === 404 || error.value?.statusCode === 400)
  throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan', fatal: true })
const errorMessage = computed(() => (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage ?? error.value?.message)
const initial = computed(() => (ev.value ? eventToFormState(ev.value) : undefined))

useHead({ title: () => `Edit ${ev.value?.title ?? 'Kegiatan'} — OpenMasjid CMS` })
</script>

<template>
  <div>
    <AdminPageHeader
      eyebrow="Ubah Kegiatan"
      :title="ev?.title ?? 'Edit Kegiatan'"
      description="Perbarui informasi kegiatan. Pembicara dan susunan acara akan diganti sesuai isian ini."
    >
      <template #actions>
        <UButton :to="tp(`/admin/events/${id}`)" color="neutral" variant="ghost" icon="i-lucide-arrow-left" class="font-semibold">
          Kembali ke Detail
        </UButton>
      </template>
    </AdminPageHeader>

    <UAlert
      v-if="!isAdmin"
      color="warning"
      variant="subtle"
      icon="i-lucide-lock"
      title="Akses terbatas"
      description="Hanya admin yang dapat mengubah kegiatan."
    />
    <UAlert
      v-else-if="error || !initial"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Kegiatan tidak dapat dimuat"
      :description="errorMessage"
    />
    <AdminFormEventForm v-else :key="id" :event-id="id" :initial="initial" />
  </div>
</template>
