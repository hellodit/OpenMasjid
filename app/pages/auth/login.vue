<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema, type LoginInput } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Masuk — OpenMasjid CMS' })

const route = useRoute()
const { signIn, isStaff } = useAuth()

const state = reactive<Partial<LoginInput>>({ email: '', password: '', remember: true })
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  error.value = null
  loading.value = true
  try {
    await signIn(event.data.email, event.data.password, event.data.remember)
    if (!isStaff.value) {
      error.value = 'Akun Anda bukan pengurus DKM sehingga tidak dapat membuka CMS.'
      return
    }
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/admin'
    await navigateTo(redirect)
  }
  catch (e) {
    const err = e as { status?: number, message?: string }
    error.value = err.status === 401 || err.status === 403
      ? (err.status === 403 && err.message ? err.message : 'Email atau password salah.')
      : (err.message || 'Gagal masuk. Coba lagi.')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
      Masuk
    </div>
    <h1 class="font-serif text-[32px] font-semibold m-0 mb-2 tracking-[-0.4px] text-cms-ink">
      Selamat datang kembali
    </h1>
    <p class="text-sm text-cms-muted m-0 mb-7 max-w-[380px]">
      Silakan masuk dengan akun pengurus untuk membuka dasbor manajemen masjid.
    </p>

    <UForm
      :schema="loginSchema"
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

      <UFormField label="Email" name="email" required>
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

      <UFormField label="Password" name="password" required>
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="••••••••"
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

      <div class="flex items-center justify-between -mt-1">
        <UCheckbox v-model="state.remember" name="remember" label="Ingat saya" />
        <NuxtLink
          to="/auth/forgot-password"
          class="text-[13px] font-semibold text-cms-green-700 hover:text-cms-green-800"
        >
          Lupa password?
        </NuxtLink>
      </div>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="loading"
        icon="i-lucide-log-in"
        :label="loading ? 'Memverifikasi...' : 'Masuk ke Dasbor'"
      />
    </UForm>

    <p class="text-[13px] text-cms-muted text-center mt-6">
      Belum memiliki akun pengurus? Hubungi admin masjid.
    </p>
  </div>
</template>
