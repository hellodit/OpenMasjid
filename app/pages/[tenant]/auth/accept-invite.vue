<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { invitationAcceptSchema } from '#shared/schemas/tenants'
import { formatDate } from '~/utils/format'
const api = useApiBase()
const tp = useTenantPath()

definePageMeta({ layout: 'auth' })
useHead({ title: 'Terima Undangan — OpenMasjid CMS' })

const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const { data: invite, error: inviteError } = await useFetch(
  () => `${api}/public/invitations/${encodeURIComponent(token.value)}`,
  { immediate: !!token.value, watch: false },
)

const invalid = computed(() => !token.value || !!inviteError.value || !invite.value)
const invalidMessage = computed(() =>
  (inviteError.value?.statusCode === 429 ? inviteError.value.statusMessage : null)
  ?? 'Tautan undangan tidak valid, sudah dipakai, atau sudah kedaluwarsa. Minta pemilik masjid mengirim undangan baru.')

const ROLE_LABEL: Record<string, string> = { admin: 'Admin — bisa mengubah data', viewer: 'Viewer — hanya melihat' }

const state = reactive({ name: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<z.output<typeof invitationAcceptSchema>>) {
  error.value = null
  loading.value = true
  try {
    const res = await $fetch(`${api}/public/invitations/${encodeURIComponent(token.value)}`, { method: 'POST', body: event.data })
    await navigateTo(res.redirectTo, { external: true })
  }
  catch (err) {
    const e = err as { statusCode?: number, data?: { statusMessage?: string } }
    error.value = e.data?.statusMessage
      ?? (e.statusCode === 404 ? 'Undangan sudah tidak berlaku.' : 'Gagal menerima undangan. Coba lagi.')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
      Undangan Pengurus
    </div>

    <template v-if="invalid">
      <h1 class="font-serif text-[32px] font-semibold m-0 mb-5 tracking-[-0.4px] text-cms-ink">
        Undangan tidak dapat dibuka
      </h1>
      <UAlert color="error" variant="subtle" icon="i-lucide-link-2-off" :description="invalidMessage" />
      <p class="text-[13px] text-cms-muted mt-6">
        Sudah punya akun pengurus?
        <NuxtLink :to="tp('/auth/login')" class="font-semibold text-cms-green-700 hover:text-cms-green-800">
          Masuk di sini
        </NuxtLink>
      </p>
    </template>

    <template v-else-if="invite">
      <h1 class="font-serif text-[32px] font-semibold m-0 mb-2 tracking-[-0.4px] text-cms-ink">
        Bergabung dengan {{ invite.mosque }}
      </h1>
      <p class="text-sm text-cms-muted m-0 mb-7 max-w-[380px]">
        Anda diundang menjadi pengurus. Lengkapi nama dan buat password untuk mulai membuka dasbor.
      </p>

      <UForm
        :schema="invitationAcceptSchema"
        :state="state"
        class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6 sm:p-7 flex flex-col gap-4"
        @submit="onSubmit"
      >
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :description="error"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField label="Email">
            <UInput :model-value="invite.email" readonly disabled icon="i-lucide-mail" class="w-full" />
          </UFormField>
          <UFormField label="Peran">
            <UInput :model-value="ROLE_LABEL[invite.role] ?? invite.role" readonly disabled icon="i-lucide-shield-check" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Nama lengkap" name="name" required>
          <UInput
            v-model="state.name"
            autocomplete="name"
            placeholder="mis. Ahmad Fauzi"
            icon="i-lucide-user"
            size="lg"
            class="w-full"
            autofocus
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
          required
          help="Jika email ini sudah punya akun jamaah di masjid ini, masukkan password akun tersebut."
        >
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Minimal 8 karakter"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
            :ui="{ trailing: 'pe-1' }"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton
          type="submit"
          size="lg"
          block
          :loading="loading"
          icon="i-lucide-check"
          :label="loading ? 'Memproses...' : 'Terima Undangan'"
        />
      </UForm>

      <p class="text-[13px] text-cms-muted text-center mt-6">
        Undangan berlaku sampai {{ formatDate(String(invite.expiresAt)) }}.
      </p>
    </template>
  </div>
</template>
