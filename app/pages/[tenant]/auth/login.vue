<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema, type LoginInput } from '#shared/schemas/auth'
const tp = useTenantPath()

definePageMeta({ layout: 'auth' })
const route = useRoute()
const { signIn, isStaff } = useAuth()
const { tenant } = useTenantContext()

useHead({ title: () => `Masuk — ${tenant.value?.name ?? 'OpenMasjid'}` })

/** Only follow redirects inside this mosque (no open redirect / cross-tenant hop). */
const redirectTarget = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith(`${tp('/')}/`) && !r.startsWith('//') ? r : null
})
const registerTo = computed(() => ({ path: tp('/auth/register'), query: redirectTarget.value ? { redirect: redirectTarget.value } : {} }))

const state = reactive<Partial<LoginInput>>({ email: '', password: '', remember: true })
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  error.value = null
  loading.value = true
  try {
    await signIn(event.data.email, event.data.password, event.data.remember)
    // Staff land on the dashboard, jamaah on their tickets. A member following
    // a redirect into /admin would only hit a 403, so send them to tickets.
    const target = redirectTarget.value
    if (isStaff.value) await navigateTo(target ?? tp('/admin'))
    else await navigateTo(target && !target.startsWith(tp('/admin')) ? target : tp('/my-tickets'))
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
      Masuk ke akun {{ tenant?.name ?? 'masjid' }}
    </h1>
    <p class="text-sm text-cms-muted m-0 mb-7 max-w-[380px]">
      Untuk jamaah dan pengurus <span class="font-semibold text-cms-ink-2">{{ tenant?.name }}</span>.
      Akun berlaku khusus untuk masjid ini.
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
          placeholder="nama@email.com"
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
          :to="tp('/auth/forgot-password')"
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
        :label="loading ? 'Memverifikasi...' : 'Masuk'"
      />
    </UForm>

    <p class="text-[13px] text-cms-muted text-center mt-6">
      Jamaah baru?
      <NuxtLink :to="registerTo" class="font-semibold text-cms-green-700 hover:text-cms-green-800">
        Buat akun
      </NuxtLink>
    </p>
    <p class="text-[12px] text-cms-muted-2 text-center mt-2">
      Akun pengurus dibuat lewat undangan pemilik masjid.
    </p>
    <p class="text-center mt-4">
      <NuxtLink :to="tp('/')" class="inline-flex items-center gap-1 text-[12.5px] font-semibold text-cms-muted hover:text-cms-ink">
        <UIcon name="i-lucide-arrow-left" class="size-3.5" /> Kembali ke halaman masjid
      </NuxtLink>
    </p>
  </div>
</template>
