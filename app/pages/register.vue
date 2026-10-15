<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { onboardingSchema, type OnboardingInput } from '#shared/schemas/tenants'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Daftarkan Masjid — OpenMasjid' })

type OnboardingOutput = FormSubmitEvent<z.output<typeof onboardingSchema>>

const toast = useToast()
const host = useRequestURL().host

const timezones = [
  { label: 'WIB — Waktu Indonesia Barat', value: 'Asia/Jakarta' },
  { label: 'WITA — Waktu Indonesia Tengah', value: 'Asia/Makassar' },
  { label: 'WIT — Waktu Indonesia Timur', value: 'Asia/Jayapura' },
] as const

type FormState = OnboardingInput & { mosque: OnboardingInput['mosque'] & { city: string } }

const state = reactive<FormState>({
  mosque: { name: '', slug: '', city: '', timezone: 'Asia/Jakarta' },
  owner: { name: '', email: '', password: '' },
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const form = useTemplateRef('form')

/* ---------- Slug: auto from name until the user edits it ---------- */
const slugTouched = ref(false)

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '')
}

watch(() => state.mosque.name, (name) => {
  if (!slugTouched.value) state.mosque.slug = slugify(name)
})

const slugModel = computed({
  get: () => state.mosque.slug,
  set: (v: string) => {
    slugTouched.value = true
    state.mosque.slug = v.toLowerCase().replace(/\s+/g, '-')
  },
})

function resetSlug() {
  slugTouched.value = false
  state.mosque.slug = slugify(state.mosque.name)
}

/* ---------- Live availability check (debounced) ---------- */
type SlugCheck = { state: 'idle' | 'checking' | 'ok' | 'taken' | 'error', message?: string, slug?: string }
const slugCheck = ref<SlugCheck>({ state: 'idle' })
let slugTimer: ReturnType<typeof setTimeout> | undefined
let slugSeq = 0

watch(() => state.mosque.slug, (slug) => {
  if (slugTimer) clearTimeout(slugTimer)
  const value = slug.trim()
  if (!value) {
    slugCheck.value = { state: 'idle' }
    return
  }
  slugCheck.value = { state: 'checking', slug: value }
  const seq = ++slugSeq
  slugTimer = setTimeout(async () => {
    try {
      const res = await $fetch('/api/onboarding/slug-available', { query: { slug: value } })
      if (seq !== slugSeq) return
      slugCheck.value = res.available
        ? { state: 'ok', slug: value, message: 'Alamat tersedia' }
        : { state: 'taken', slug: value, message: res.reason ?? 'Alamat tidak tersedia' }
    }
    catch {
      if (seq !== slugSeq) return
      slugCheck.value = { state: 'error', slug: value, message: 'Tidak dapat memeriksa alamat saat ini' }
    }
  }, 400)
})

onBeforeUnmount(() => {
  if (slugTimer) clearTimeout(slugTimer)
})

/* ---------- Submit ---------- */
async function onSubmit(event: OnboardingOutput) {
  error.value = null
  loading.value = true
  try {
    const res = await $fetch('/api/onboarding', { method: 'POST', body: event.data })
    toast.add({
      title: 'Masjid berhasil didaftarkan',
      description: 'Mengarahkan ke dasbor pengurus…',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    await navigateTo(res.redirectTo, { external: true })
  }
  catch (e) {
    const err = e as { status?: number, statusCode?: number, statusMessage?: string, data?: { statusMessage?: string, message?: string } }
    const status = err.status ?? err.statusCode
    const message = err.data?.statusMessage || err.data?.message || err.statusMessage
      || (status === 429 ? 'Terlalu banyak percobaan. Coba lagi nanti.' : 'Gagal mendaftarkan masjid. Coba lagi.')
    error.value = message
    if (status === 409) {
      slugCheck.value = { state: 'taken', slug: state.mosque.slug, message }
      form.value?.setErrors([{ name: 'mosque.slug', message }], 'mosque.slug')
    }
    toast.add({ title: 'Pendaftaran gagal', description: message, color: 'error', icon: 'i-lucide-alert-circle' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-[640px] px-4 sm:px-6 py-10 sm:py-14">
    <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
      Daftarkan Masjid
    </div>
    <h1 class="font-serif text-[30px] sm:text-[34px] font-semibold m-0 mb-2 tracking-[-0.4px] text-cms-ink">
      Mulai kelola masjid Anda
    </h1>
    <p class="text-sm text-cms-muted m-0 mb-7 max-w-[520px]">
      Isi data masjid dan akun pemilik. Setelah terdaftar, Anda langsung masuk ke dasbor pengurus
      dan dapat mengundang pengurus lain.
    </p>

    <UForm
      ref="form"
      :schema="onboardingSchema"
      :state="state"
      class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6 sm:p-7 flex flex-col gap-6"
      @submit="onSubmit"
    >
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :description="error"
      />

      <!-- Masjid -->
      <fieldset class="flex flex-col gap-4 border-0 p-0 m-0 min-w-0">
        <legend class="flex items-center gap-2 mb-4 p-0">
          <span class="w-8 h-8 rounded-[10px] bg-cms-green-50 text-cms-green-700 grid place-items-center shrink-0">
            <UIcon name="i-lucide-landmark" class="size-4" />
          </span>
          <span class="font-serif text-[19px] font-semibold text-cms-ink">Masjid</span>
        </legend>

        <UFormField label="Nama masjid" name="mosque.name" required>
          <UInput
            v-model="state.mosque.name"
            placeholder="Masjid Al-Hikmah"
            autocomplete="organization"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Alamat halaman masjid"
          name="mosque.slug"
          required
          description="Huruf kecil, angka, dan tanda -. Dipakai untuk halaman publik dan dasbor masjid."
        >
          <UFieldGroup size="lg" class="w-full">
            <UBadge
              color="neutral"
              variant="outline"
              :label="`${host}/`"
              class="max-w-[45%] truncate text-cms-muted font-normal"
            />
            <UInput
              v-model="slugModel"
              placeholder="al-hikmah"
              autocomplete="off"
              spellcheck="false"
              class="flex-1 min-w-0"
              :ui="{ trailing: 'pe-2' }"
            >
              <template #trailing>
                <UIcon
                  v-if="slugCheck.state === 'checking'"
                  name="i-lucide-loader-circle"
                  class="size-4 animate-spin text-cms-muted"
                  aria-hidden="true"
                />
                <UIcon
                  v-else-if="slugCheck.state === 'ok'"
                  name="i-lucide-circle-check"
                  class="size-4 text-cms-green-600"
                  aria-hidden="true"
                />
                <UIcon
                  v-else-if="slugCheck.state === 'taken'"
                  name="i-lucide-circle-x"
                  class="size-4 text-cms-rose"
                  aria-hidden="true"
                />
              </template>
            </UInput>
          </UFieldGroup>
          <template #help>
            <div class="flex items-center justify-between gap-3 min-h-5">
              <span
                v-if="slugCheck.state === 'ok' || slugCheck.state === 'taken' || slugCheck.state === 'error'"
                aria-live="polite"
                :class="{
                  'text-cms-green-700': slugCheck.state === 'ok',
                  'text-cms-rose': slugCheck.state === 'taken',
                  'text-cms-muted': slugCheck.state === 'error',
                }"
              >
                {{ slugCheck.state === 'ok' ? '✓' : slugCheck.state === 'taken' ? '✗' : '' }} {{ slugCheck.message }}
              </span>
              <span v-else-if="slugCheck.state === 'checking'" class="text-cms-muted">Memeriksa…</span>
              <span v-else />
              <UButton
                v-if="slugTouched && state.mosque.name"
                size="xs"
                variant="link"
                color="neutral"
                label="Buat dari nama"
                icon="i-lucide-rotate-ccw"
                @click="resetSlug"
              />
            </div>
          </template>
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Kota" name="mosque.city">
            <UInput
              v-model="state.mosque.city"
              placeholder="Bandung"
              autocomplete="address-level2"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Zona waktu" name="mosque.timezone" required>
            <USelect
              v-model="state.mosque.timezone"
              :items="[...timezones]"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>
      </fieldset>

      <USeparator />

      <!-- Akun pemilik -->
      <fieldset class="flex flex-col gap-4 border-0 p-0 m-0 min-w-0">
        <legend class="flex items-center gap-2 mb-2 p-0">
          <span class="w-8 h-8 rounded-[10px] bg-cms-gold-soft text-cms-gold-ink grid place-items-center shrink-0">
            <UIcon name="i-lucide-user-round" class="size-4" />
          </span>
          <span class="font-serif text-[19px] font-semibold text-cms-ink">Akun pemilik</span>
        </legend>
        <p class="text-[13px] text-cms-muted m-0 -mt-1">
          Akun ini hanya berlaku untuk masjid ini. Jika Anda mengelola masjid lain, buat akun terpisah di masjid tersebut.
        </p>

        <UFormField label="Nama lengkap" name="owner.name" required>
          <UInput
            v-model="state.owner.name"
            placeholder="Nama Anda"
            autocomplete="name"
            icon="i-lucide-user"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Email" name="owner.email" required>
          <UInput
            v-model="state.owner.email"
            type="email"
            placeholder="nama@masjid.id"
            autocomplete="email"
            icon="i-lucide-mail"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" name="owner.password" required help="Minimal 8 karakter.">
          <UInput
            v-model="state.owner.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
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
      </fieldset>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="loading"
        :disabled="slugCheck.state === 'taken'"
        icon="i-lucide-check"
        :label="loading ? 'Mendaftarkan…' : 'Daftarkan Masjid'"
      />
    </UForm>

    <p class="text-[13px] text-cms-muted text-center mt-6">
      <NuxtLink to="/" class="font-semibold text-cms-green-700 hover:text-cms-green-800">
        ← Kembali ke beranda
      </NuxtLink>
    </p>
  </div>
</template>
