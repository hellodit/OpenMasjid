<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Lupa Password — OpenMasjid CMS' })

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const sent = ref(false)

const submit = async () => {
  error.value = null

  if (!email.value) {
    error.value = 'Email wajib diisi.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Format email tidak valid.'
    return
  }

  loading.value = true
  // TODO: panggil endpoint forgot-password sebenarnya
  await new Promise(r => setTimeout(r, 700))
  loading.value = false
  sent.value = true
}

const resend = () => {
  sent.value = false
  submit()
}
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

    <!-- State: form -->
    <form
      v-if="!sent"
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

      <AdminFormField
        label="Email terdaftar"
        required
        help="Tautan reset akan kedaluwarsa setelah 30 menit."
      >
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

      <AdminBtn
        type="submit"
        variant="primary"
        size="lg"
        class="w-full justify-center mt-1"
      >
        <Icon v-if="loading" name="lucide:loader-2" class="animate-spin" size="18" />
        <span>{{ loading ? 'Mengirim tautan...' : 'Kirim tautan reset' }}</span>
      </AdminBtn>
    </form>

    <!-- State: success -->
    <div
      v-else
      class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6 sm:p-7 flex flex-col items-center text-center"
    >
      <div class="w-14 h-14 rounded-full bg-cms-green-100 text-cms-green-700 grid place-items-center mb-4">
        <Icon name="lucide:mail-check" size="28" />
      </div>
      <h2 class="font-serif text-[20px] font-semibold m-0 mb-1.5 text-cms-ink">
        Periksa kotak masuk Anda
      </h2>
      <p class="text-sm text-cms-muted m-0 mb-5 max-w-[340px]">
        Kami sudah mengirim tautan untuk membuat ulang password ke
        <span class="font-semibold text-cms-ink-2">{{ email }}</span>. Tautan berlaku 30 menit.
      </p>

      <div class="flex flex-col sm:flex-row gap-2.5 w-full">
        <AdminBtn to="/auth/login" variant="primary" size="md" class="flex-1 justify-center">
          <Icon name="lucide:log-in" size="16" />
          Kembali ke halaman masuk
        </AdminBtn>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-cms border border-cms-border bg-cms-surface text-sm font-semibold text-cms-ink hover:bg-cms-surface-2 transition-colors flex-1"
          @click="resend"
        >
          <Icon name="lucide:rotate-cw" size="16" />
          Kirim ulang
        </button>
      </div>

      <p class="text-[12px] text-cms-muted-2 mt-5">
        Tidak menerima email? Cek folder spam atau hubungi admin masjid.
      </p>
    </div>

    <!-- Back link (form state) -->
    <p v-if="!sent" class="text-[13px] text-cms-muted text-center mt-6">
      <NuxtLink
        to="/auth/login"
        class="inline-flex items-center gap-1.5 font-semibold text-cms-green-700 hover:text-cms-green-800"
      >
        <Icon name="lucide:arrow-left" size="14" />
        Kembali ke halaman masuk
      </NuxtLink>
    </p>
  </div>
</template>
