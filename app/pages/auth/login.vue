<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Masuk — Masjidku CMS' })

const email = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const router = useRouter()

const submit = async () => {
  error.value = null

  if (!email.value || !password.value) {
    error.value = 'Email dan password wajib diisi.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Format email tidak valid.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password minimal 6 karakter.'
    return
  }

  loading.value = true
  // TODO: panggil endpoint auth sebenarnya
  await new Promise(r => setTimeout(r, 700))
  loading.value = false

  router.push('/admin')
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
      Silakan masuk dengan akun pengurus untuk membuka dasbor manajemen kegiatan masjid.
    </p>

    <form
      class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6 sm:p-7 flex flex-col gap-4"
      novalidate
      @submit.prevent="submit"
    >
      <div
        v-if="error"
        class="flex items-start gap-2 rounded-cms border border-cms-rose-soft bg-cms-rose-soft text-cms-rose px-3 py-2.5 text-[13px]"
        role="alert"
      >
        <Icon name="lucide:alert-circle" class="mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <AdminFormField label="Email" required>
        <div class="relative">
          <Icon
            name="lucide:mail"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-cms-muted"
            size="18"
          />
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="nama@masjid.id"
            class="cms-input w-full h-11 pl-10 pr-3 rounded-cms border border-cms-border bg-cms-surface text-sm text-cms-ink placeholder:text-cms-muted-2 outline-none transition-shadow"
          >
        </div>
      </AdminFormField>

      <AdminFormField label="Password" required>
        <template #default>
          <div class="relative">
            <Icon
              name="lucide:lock"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-cms-muted"
              size="18"
            />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="cms-input w-full h-11 pl-10 pr-10 rounded-cms border border-cms-border bg-cms-surface text-sm text-cms-ink placeholder:text-cms-muted-2 outline-none transition-shadow"
            >
            <button
              type="button"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-md text-cms-muted hover:text-cms-ink hover:bg-cms-surface-2"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" size="18" />
            </button>
          </div>
        </template>
      </AdminFormField>

      <div class="flex items-center justify-between -mt-1">
        <label class="inline-flex items-center gap-2 text-[13px] text-cms-ink-2 cursor-pointer select-none">
          <input
            v-model="remember"
            type="checkbox"
            class="w-4 h-4 rounded border-cms-border-strong text-cms-green-700 focus:ring-cms-green-300"
          >
          Ingat saya
        </label>
        <NuxtLink
          to="/auth/forgot-password"
          class="text-[13px] font-semibold text-cms-green-700 hover:text-cms-green-800"
        >
          Lupa password?
        </NuxtLink>
      </div>

      <AdminBtn
        type="submit"
        variant="primary"
        size="lg"
        class="w-full justify-center mt-1"
      >
        <Icon v-if="loading" name="lucide:loader-2" class="animate-spin" size="18" />
        <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Dasbor' }}</span>
      </AdminBtn>

      <div class="flex items-center gap-3 my-1 cms-motif-divider text-[11px] uppercase tracking-[1.2px] text-cms-muted">
        <span>atau</span>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 h-11 rounded-cms border border-cms-border bg-cms-surface text-sm font-semibold text-cms-ink hover:bg-cms-surface-2 transition-colors"
      >
        <Icon name="lucide:building-2" size="18" />
        Masuk dengan SSO Yayasan
      </button>
    </form>

    <p class="text-[13px] text-cms-muted text-center mt-6">
      Belum memiliki akun pengurus?
      <a href="#" class="font-semibold text-cms-green-700 hover:text-cms-green-800">Hubungi admin masjid</a>
    </p>
  </div>
</template>
