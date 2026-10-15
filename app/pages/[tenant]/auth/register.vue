<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

definePageMeta({ layout: 'auth' })

const tp = useTenantPath()
const route = useRoute()
const ctx = useTenantContext()
const { tenant } = ctx

useHead({ title: () => `Daftar akun jamaah — ${tenant.value?.name ?? 'OpenMasjid'}` })

const schema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(120, 'Nama terlalu panjang'),
    email: z.email('Format email tidak valid'),
    phone: z
      .string()
      .trim()
      .max(30, 'Nomor terlalu panjang')
      .regex(/^[0-9+\-\s()]*$/, 'Nomor hanya boleh berisi angka, spasi, +, -')
      .optional(),
    password: z.string().min(8, 'Password minimal 8 karakter').max(128, 'Password terlalu panjang'),
    confirm: z.string(),
  })
  .refine(v => v.password === v.confirm, { message: 'Konfirmasi password tidak sama', path: ['confirm'] })
type RegisterInput = z.infer<typeof schema>

const state = reactive<Partial<RegisterInput>>({ name: '', email: '', phone: '', password: '', confirm: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

/** Only follow redirects inside this mosque (no open redirect / cross-tenant hop). */
const redirectTarget = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith(`${tp('/')}/`) && !r.startsWith('//') ? r : null
})
const loginTo = computed(() => ({ path: tp('/auth/login'), query: redirectTarget.value ? { redirect: redirectTarget.value } : {} }))

async function onSubmit(event: FormSubmitEvent<RegisterInput>) {
  error.value = null
  loading.value = true
  try {
    const { name, email, phone, password } = event.data
    const { error: err } = await getAuthClient(ctx.slug.value).signUp.email({
      name,
      email,
      password,
      ...(phone ? { phone } : {}),
    })
    if (err) {
      error.value = err.status === 422 || err.code === 'USER_ALREADY_EXISTS' || err.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
        ? 'Email ini sudah terdaftar di masjid ini. Silakan masuk.'
        : (err.status === 429 ? 'Terlalu banyak percobaan. Coba lagi beberapa saat.' : 'Gagal membuat akun. Coba lagi.')
      return
    }
    await ctx.load(true)
    await navigateTo(redirectTarget.value ?? tp('/my-tickets'))
  }
  catch {
    error.value = 'Gagal membuat akun. Periksa koneksi Anda lalu coba lagi.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
      Akun jamaah
    </div>
    <h1 class="font-serif text-[32px] font-semibold m-0 mb-2 tracking-[-0.4px] text-cms-ink">
      Buat akun baru
    </h1>
    <p class="text-sm text-cms-muted m-0 mb-7 max-w-[380px]">
      Daftar sebagai jamaah <span class="font-semibold text-cms-ink-2">{{ tenant?.name }}</span> untuk mendaftar
      kegiatan dan menyimpan tiket QR. Akun ini hanya berlaku untuk masjid ini.
    </p>

    <UForm
      :schema="schema"
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

      <UFormField label="Nama lengkap" name="name" required>
        <UInput
          v-model="state.name"
          autocomplete="name"
          placeholder="Nama Anda"
          icon="i-lucide-user"
          size="lg"
          class="w-full"
        />
      </UFormField>

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

      <UFormField label="Nomor HP / WhatsApp" name="phone" hint="Opsional">
        <UInput
          v-model="state.phone"
          type="tel"
          autocomplete="tel"
          placeholder="08xx xxxx xxxx"
          icon="i-lucide-phone"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Password" name="password" required>
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

      <UFormField label="Konfirmasi password" name="confirm" required>
        <UInput
          v-model="state.confirm"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="Ulangi password"
          icon="i-lucide-lock-keyhole"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="loading"
        icon="i-lucide-user-plus"
        :label="loading ? 'Membuat akun...' : 'Daftar'"
      />
    </UForm>

    <p class="text-[13px] text-cms-muted text-center mt-6">
      Sudah punya akun?
      <NuxtLink :to="loginTo" class="font-semibold text-cms-green-700 hover:text-cms-green-800">
        Masuk
      </NuxtLink>
    </p>
  </div>
</template>
