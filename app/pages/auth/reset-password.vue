<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { resetPasswordSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Password Baru — OpenMasjid CMS' })

type Input = z.infer<typeof resetPasswordSchema>
const route = useRoute()
const toast = useToast()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const linkError = computed(() => typeof route.query.error === 'string')

const state = reactive<Partial<Input>>({ password: '', confirm: '' })
const loading = ref(false)
const error = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<Input>) {
  error.value = null
  loading.value = true
  const { error: err } = await authClient.resetPassword({ newPassword: event.data.password, token: token.value })
  loading.value = false
  if (err) {
    error.value = err.message || 'Tautan tidak valid atau sudah kedaluwarsa.'
    return
  }
  toast.add({ title: 'Password diperbarui', description: 'Silakan masuk dengan password baru.', color: 'success' })
  await navigateTo('/auth/login')
}
</script>

<template>
  <div>
    <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
      Password Baru
    </div>
    <h1 class="font-serif text-[32px] font-semibold m-0 mb-7 tracking-[-0.4px] text-cms-ink">
      Buat password baru
    </h1>

    <UAlert
      v-if="!token || linkError"
      color="error"
      variant="subtle"
      icon="i-lucide-link-2-off"
      title="Tautan tidak valid"
      description="Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru."
      :actions="[{ label: 'Minta tautan baru', to: '/auth/forgot-password' }]"
    />

    <UForm
      v-else
      :schema="resetPasswordSchema"
      :state="state"
      class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6 sm:p-7 flex flex-col gap-4"
      @submit="onSubmit"
    >
      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-alert-circle" :description="error" />
      <UFormField label="Password baru" name="password" required>
        <UInput v-model="state.password" type="password" autocomplete="new-password" size="lg" class="w-full" />
      </UFormField>
      <UFormField label="Ulangi password" name="confirm" required>
        <UInput v-model="state.confirm" type="password" autocomplete="new-password" size="lg" class="w-full" />
      </UFormField>
      <UButton type="submit" size="lg" block :loading="loading" label="Simpan password" />
    </UForm>
  </div>
</template>
