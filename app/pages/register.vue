<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { onboardingSchema, tenantSlug, type OnboardingInput } from '#shared/schemas/tenants'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Daftarkan Masjid — OpenMasjid' })

type OnboardingOutput = FormSubmitEvent<z.output<typeof onboardingSchema>>

const toast = useToast()
const host = useRequestURL().host

const state = reactive<OnboardingInput & { mosque: { slug: string } }>({
  mosque: { name: '', slug: '' },
  owner: { name: '', email: '', password: '' },
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const form = useTemplateRef('form')

/* ---------- Address: generated from the name unless the user opens "Ubah" ---------- */
const customSlug = ref(false)

/** What the server would generate (before any -2/-3 suffix). */
const generatedSlug = computed(() => {
  const base = mosqueSlugFromName(state.mosque.name)
  return tenantSlug.safeParse(base).success ? base : ''
})

/** The slug whose availability we show: the custom one, or the generated one. */
const shownSlug = computed(() => (customSlug.value ? state.mosque.slug.trim() : generatedSlug.value))

function openCustomSlug() {
  customSlug.value = true
  if (!state.mosque.slug) state.mosque.slug = generatedSlug.value
}

function closeCustomSlug() {
  customSlug.value = false
  state.mosque.slug = ''
  form.value?.clear('mosque.slug')
}

const slugModel = computed({
  get: () => state.mosque.slug,
  set: (v: string) => {
    state.mosque.slug = v.toLowerCase().replace(/\s+/g, '-')
  },
})

/* ---------- Live availability check (debounced) ---------- */
type SlugCheck = { state: 'idle' | 'checking' | 'ok' | 'taken' | 'error', message?: string, slug?: string }
const slugCheck = ref<SlugCheck>({ state: 'idle' })
let slugTimer: ReturnType<typeof setTimeout> | undefined
let slugSeq = 0

watch(shownSlug, (value) => {
  if (slugTimer) clearTimeout(slugTimer)
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

/** Hint under the generated address (no custom slug). */
const generatedHint = computed(() => {
  const c = slugCheck.value
  if (c.slug !== generatedSlug.value) return null
  if (c.state === 'ok') return { tone: 'ok', text: 'Alamat tersedia' }
  if (c.state === 'taken') return { tone: 'muted', text: `Sudah dipakai — alamat akan menjadi ${c.slug}-2 (atau nomor berikutnya)` }
  if (c.state === 'checking') return { tone: 'muted', text: 'Memeriksa…' }
  return null
})

/* ---------- Submit ---------- */
async function onSubmit(event: OnboardingOutput) {
  error.value = null
  loading.value = true
  try {
    const body = {
      mosque: customSlug.value && event.data.mosque.slug
        ? { name: event.data.mosque.name, slug: event.data.mosque.slug }
        : { name: event.data.mosque.name },
      owner: event.data.owner,
    }
    const res = await $fetch('/api/onboarding', { method: 'POST', body })
    toast.add({
      title: 'Masjid berhasil didaftarkan',
      description: 'Mengarahkan ke langkah pengaturan awal…',
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
      if (!customSlug.value) openCustomSlug()
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
  <div class="mx-auto max-w-[560px] px-4 sm:px-6 py-10 sm:py-14">
    <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
      Daftarkan Masjid
    </div>
    <h1 class="font-serif text-[30px] sm:text-[34px] font-semibold m-0 mb-2 tracking-[-0.4px] text-cms-ink">
      Mulai kelola masjid Anda
    </h1>
    <p class="text-sm text-cms-muted m-0 mb-7 max-w-[520px]">
      Cukup nama masjid dan akun Anda. Lokasi, jadwal sholat, dan kontak bisa dilengkapi
      setelah ini — langkah demi langkah.
    </p>

    <UForm
      ref="form"
      :schema="onboardingSchema"
      :state="state"
      class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-5 sm:p-7 flex flex-col gap-5"
      @submit="onSubmit"
    >
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :description="error"
      />

      <UFormField label="Nama masjid" name="mosque.name" required>
        <UInput
          v-model="state.mosque.name"
          placeholder="Masjid Al-Hikmah"
          autocomplete="organization"
          icon="i-lucide-landmark"
          size="lg"
          class="w-full"
        />
        <template #help>
          <div v-if="!customSlug" class="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-h-5">
            <template v-if="generatedSlug">
              <span class="text-cms-muted">Alamat halaman:</span>
              <span class="font-medium text-cms-ink break-all">{{ host }}/{{ generatedSlug }}</span>
              <UButton
                size="xs"
                variant="link"
                color="primary"
                label="Ubah"
                class="px-0"
                @click="openCustomSlug"
              />
              <span
                v-if="generatedHint"
                aria-live="polite"
                class="basis-full text-[12px]"
                :class="generatedHint.tone === 'ok' ? 'text-cms-green-700' : 'text-cms-muted'"
              >
                {{ generatedHint.tone === 'ok' ? '✓ ' : '' }}{{ generatedHint.text }}
              </span>
            </template>
            <span v-else class="text-cms-muted">Alamat halaman masjid dibuat otomatis dari nama.</span>
          </div>
        </template>
      </UFormField>

      <UFormField
        v-if="customSlug"
        label="Alamat halaman masjid"
        name="mosque.slug"
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
              size="xs"
              variant="link"
              color="neutral"
              label="Buat otomatis"
              icon="i-lucide-rotate-ccw"
              @click="closeCustomSlug"
            />
          </div>
        </template>
      </UFormField>

      <USeparator />

      <UFormField label="Nama Anda" name="owner.name" required>
        <UInput
          v-model="state.owner.name"
          placeholder="Nama lengkap"
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

      <p class="text-[12.5px] text-cms-muted m-0 -mt-1">
        Akun ini menjadi akun pemilik masjid dan hanya berlaku untuk masjid ini.
      </p>

      <UButton
        type="submit"
        size="lg"
        block
        :loading="loading"
        :disabled="customSlug && slugCheck.state === 'taken'"
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
