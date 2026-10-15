<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { invitationCreateSchema, type InvitationCreateInput } from '#shared/schemas/tenants'
const api = useApiBase()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ invited: [] }>()

const ROLES = [
  { label: 'Admin — bisa mengubah data', value: 'admin' },
  { label: 'Viewer — hanya melihat', value: 'viewer' },
]

const state = reactive<InvitationCreateInput>({ email: '', role: 'viewer' })
const saving = ref(false)
const result = ref<{ email: string, url: string } | null>(null)
const copied = ref(false)
const toast = useToast()

watch(open, (v) => {
  if (!v) return
  Object.assign(state, { email: '', role: 'viewer' })
  result.value = null
  copied.value = false
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof invitationCreateSchema>>) {
  saving.value = true
  try {
    const res = await $fetch(`${api}/admin/team/invitations`, { method: 'POST', body: event.data })
    result.value = { email: res.invitation?.email ?? event.data.email, url: res.url }
    emit('invited')
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ color: 'error', title: 'Gagal membuat undangan', description: e.data?.statusMessage })
  }
  finally {
    saving.value = false
  }
}

async function copy() {
  if (!result.value) return
  try {
    await navigator.clipboard.writeText(result.value.url)
    copied.value = true
    toast.add({ color: 'success', title: 'Tautan disalin', icon: 'i-lucide-check' })
  }
  catch {
    toast.add({ color: 'error', title: 'Gagal menyalin', description: 'Salin tautan secara manual.' })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="result ? 'Undangan dibuat' : 'Undang Pengurus'"
    :description="result ? `Kirim tautan ini ke ${result.email}.` : 'Pengurus yang diundang akan membuat akun sendiri melalui tautan undangan.'"
    :dismissible="!result"
  >
    <template #body>
      <div v-if="result" class="space-y-4">
        <UFormField label="Tautan undangan">
          <div class="flex gap-2">
            <UInput :model-value="result.url" readonly class="w-full font-mono" @focus="($event.target as HTMLInputElement).select()" />
            <UButton
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              :label="copied ? 'Tersalin' : 'Salin'"
              color="neutral"
              variant="outline"
              @click="copy"
            />
          </div>
        </UFormField>
        <UAlert
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          title="Tautan hanya ditampilkan sekali"
          description="Simpan atau kirim sekarang. Tautan berlaku 7 hari. Pengiriman email belum tersedia, jadi kirimkan tautan ini secara manual (mis. lewat WhatsApp atau email pribadi). Jika hilang, buat undangan baru."
        />
      </div>

      <UForm v-else id="invite-form" :schema="invitationCreateSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Email" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="off"
            placeholder="nama@masjid.id"
            icon="i-lucide-mail"
            class="w-full"
            autofocus
          />
        </UFormField>
        <UFormField label="Peran" name="role" required>
          <USelect v-model="state.role" :items="ROLES" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <template v-if="result">
          <UButton label="Selesai" @click="open = false" />
        </template>
        <template v-else>
          <UButton color="neutral" variant="outline" label="Batal" @click="open = false" />
          <UButton type="submit" form="invite-form" icon="i-lucide-send" :loading="saving" label="Buat Undangan" />
        </template>
      </div>
    </template>
  </UModal>
</template>
