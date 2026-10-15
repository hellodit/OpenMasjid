<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { forgotPasswordSchema } from '#shared/schemas/auth'
const slug = useTenantSlug()
const authClient = computed(() => getAuthClient(slug.value))
const tp = useTenantPath()

definePageMeta({ layout: 'auth' })
useHead({ title: 'Lupa Password — OpenMasjid CMS' })

type Input = z.infer<typeof forgotPasswordSchema>
const state = reactive<Partial<Input>>({ email: '' })
const loading = ref(false)
const error = ref<string | null>(null)
const sent = ref(false)

async function send(email: string) {
  error.value = null
  loading.value = true
  const { error: err } = await authClient.value.requestPasswordReset({
    email,
    redirectTo: tp('/auth/reset-password'),
  })
  loading.value = false
  if (err) {
    error.value = err.message || 'Gagal mengirim tautan. Coba lagi.'
    return
  }
  // Always show success (even for unknown emails) to avoid account enumeration.
  sent.value = true
}

const onSubmit = (event: FormSubmitEvent<Input>) => send(event.data.email)
</script>

<template>
  <div>
    <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
      Lupa Password
    </div>
    <h1 class="font-serif text-[32px] font-semibold m-0 mb-2 tracking-[-0.4px] text-cms-ink">
      Atur ulang password
    </h1>
    <p class="text-sm text-cms-muted m-0 mb-7 max-w-[380px]">
      Masukkan email pengurus yang terdaftar. Kami akan mengirim tautan untuk membuat password baru.
    </p>

    <UForm
      v-if="!sent"
      :schema="forgotPasswordSchema"
      :state="state"
      class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6 sm:p-7 flex flex-col gap-4"
      @submit="onSubmit"
    >
      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-alert-circle" :description="error" />

      <UFormField
        label="Email terdaftar"
        name="email"
        required
        help="Tautan reset akan kedaluwarsa setelah 1 jam."
      >
        <UInput
          v-model="state.email"
          type="email"
          autocomplete="email"
          placeholder="nama@masjid.id"
          icon="i-lucide-mail"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" size="lg" block :loading="loading" label="Kirim tautan reset" />
    </UForm>

    <div
      v-else
      class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6 sm:p-7 flex flex-col items-center text-center"
    >
      <div class="w-14 h-14 rounded-full bg-cms-green-100 text-cms-green-700 grid place-items-center mb-4">
        <UIcon name="i-lucide-mail-check" class="size-7" />
      </div>
      <h2 class="font-serif text-[20px] font-semibold m-0 mb-1.5 text-cms-ink">
        Periksa kotak masuk Anda
      </h2>
      <p class="text-sm text-cms-muted m-0 mb-5 max-w-[340px]">
        Jika <span class="font-semibold text-cms-ink-2">{{ state.email }}</span> terdaftar, tautan untuk
        membuat password baru sudah dikirim.
      </p>

      <div class="flex flex-col sm:flex-row gap-2.5 w-full">
        <UButton :to="tp('/auth/login')" icon="i-lucide-log-in" class="flex-1 justify-center" label="Kembali ke halaman masuk" />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-rotate-cw"
          class="flex-1 justify-center"
          :loading="loading"
          label="Kirim ulang"
          @click="send(state.email!)"
        />
      </div>
    </div>

    <p v-if="!sent" class="text-[13px] text-cms-muted text-center mt-6">
      <NuxtLink
        :to="tp('/auth/login')"
        class="inline-flex items-center gap-1.5 font-semibold text-cms-green-700 hover:text-cms-green-800"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        Kembali ke halaman masuk
      </NuxtLink>
    </p>
  </div>
</template>
