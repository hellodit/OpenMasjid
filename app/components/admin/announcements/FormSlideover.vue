<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { announcementSchema } from '#shared/schemas/announcements'
import { announcementVisibility } from '#shared/utils/announcements'
import type { AnnouncementRow } from './Card.vue'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ announcement?: AnnouncementRow | null, today: string }>()
const emit = defineEmits<{ saved: [] }>()

const api = useApiBase()
const toast = useToast()

interface FormState {
  title: string
  body: string
  status: 'draft' | 'published' | 'archived'
  isPinned: boolean
  showOnDisplay: boolean
  startsOn: string
  endsOn: string
}

const empty = (): FormState => ({
  title: '',
  body: '',
  status: 'published',
  isPinned: false,
  showOnDisplay: true,
  startsOn: '',
  endsOn: '',
})

const state = reactive<FormState>(empty())
const saving = ref(false)
const formError = ref<string | null>(null)
const isEdit = computed(() => !!props.announcement)

watch(open, (v) => {
  if (!v) return
  formError.value = null
  const a = props.announcement
  Object.assign(state, a
    ? {
        title: a.title,
        body: a.body ?? '',
        status: a.status,
        isPinned: a.isPinned,
        showOnDisplay: a.showOnDisplay,
        startsOn: a.startsOn ?? '',
        endsOn: a.endsOn ?? '',
      }
    : empty())
}, { immediate: true })

const statusItems = [
  { label: 'Terbitkan', value: 'published', description: 'Tampil di portal (dan TV) sesuai tanggal tayang.' },
  { label: 'Simpan sebagai draf', value: 'draft', description: 'Tersimpan, belum tampil di mana pun.' },
  { label: 'Arsipkan', value: 'archived', description: 'Disembunyikan, tetap tersimpan di CMS.' },
]

const preview = computed(() => announcementVisibility(
  { status: state.status, startsOn: state.startsOn || null, endsOn: state.endsOn || null },
  props.today,
))

const previewText = computed(() => ({
  active: 'Pengumuman akan langsung tampil setelah disimpan.',
  scheduled: `Pengumuman akan mulai tampil pada ${formatDate(state.startsOn)}.`,
  expired: 'Tanggal selesai sudah lewat — pengumuman tidak akan tampil.',
  draft: 'Draf tidak tampil di portal maupun layar TV.',
  archived: 'Pengumuman arsip tidak tampil di portal maupun layar TV.',
} as const)[preview.value])

async function onSubmit(event: FormSubmitEvent<z.output<typeof announcementSchema>>) {
  saving.value = true
  formError.value = null
  try {
    if (props.announcement) {
      await $fetch(`${api}/admin/announcements/${props.announcement.id}`, { method: 'PUT', body: event.data })
      toast.add({ color: 'success', title: 'Pengumuman diperbarui' })
    }
    else {
      await $fetch(`${api}/admin/announcements`, { method: 'POST', body: event.data })
      toast.add({
        color: 'success',
        title: event.data.status === 'draft' ? 'Draf pengumuman disimpan' : 'Pengumuman dibuat',
      })
    }
    open.value = false
    emit('saved')
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    formError.value = e.data?.statusMessage ?? 'Terjadi kesalahan. Coba lagi.'
    toast.add({ color: 'error', title: 'Gagal menyimpan pengumuman', description: e.data?.statusMessage })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="isEdit ? 'Ubah Pengumuman' : 'Pengumuman Baru'"
    description="Pengumuman tampil di portal jamaah dan, bila diaktifkan, di layar TV masjid."
    :ui="{ content: 'max-w-xl' }"
  >
    <template #body>
      <UForm id="announcement-form" :schema="announcementSchema" :state="state" class="space-y-5" @submit="onSubmit">
        <UAlert v-if="formError" color="error" variant="subtle" icon="i-lucide-triangle-alert" :title="formError" />

        <UFormField label="Judul" name="title" required>
          <UInput v-model="state.title" placeholder="mis. Kerja bakti membersihkan masjid" :maxlength="160" class="w-full" autofocus />
        </UFormField>

        <UFormField label="Isi pengumuman" name="body" hint="Opsional" help="Baris baru akan tetap ditampilkan.">
          <UTextarea v-model="state.body" :rows="6" autoresize :maxrows="14" :maxlength="5000" class="w-full" />
        </UFormField>

        <UFormField label="Status" name="status">
          <URadioGroup v-model="state.status" :items="statusItems" variant="card" />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField label="Tanggal mulai" name="startsOn" hint="Opsional">
            <UInput v-model="state.startsOn" type="date" class="w-full" />
          </UFormField>
          <UFormField label="Tanggal selesai" name="endsOn" hint="Opsional">
            <UInput v-model="state.endsOn" type="date" :min="state.startsOn || undefined" class="w-full" />
          </UFormField>
        </div>
        <p class="text-[12.5px] text-cms-muted -mt-2 m-0">
          Kosongkan untuk menayangkan tanpa batas waktu.
        </p>

        <div class="grid gap-3">
          <AdminFormToggleCard
            v-model="state.isPinned"
            title="Sematkan"
            description="Tampil paling atas di daftar pengumuman."
          />
          <AdminFormToggleCard
            v-model="state.showOnDisplay"
            title="Tampilkan di layar TV"
            description="Ikut bergulir di layar TV masjid selama masa tayang."
          />
        </div>

        <div class="flex items-start gap-2.5 rounded-cms bg-cms-surface-2 border border-cms-border px-3.5 py-3">
          <AdminAnnouncementsVisibilityBadge :visibility="preview" class="shrink-0 mt-px" />
          <span class="text-[12.5px] text-cms-ink-2">{{ previewText }}</span>
        </div>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="outline" label="Batal" @click="open = false" />
        <UButton type="submit" form="announcement-form" :loading="saving" :label="isEdit ? 'Simpan' : 'Buat Pengumuman'" />
      </div>
    </template>
  </USlideover>
</template>
