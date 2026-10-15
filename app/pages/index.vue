<script setup lang="ts">
definePageMeta({ layout: 'platform' })
useHead({ title: 'OpenMasjid — Platform manajemen masjid' })
useSeoMeta({
  description: 'Kelola kegiatan & pendaftaran jamaah, buku kas transparan, serta jadwal sholat dan layar TV masjid dalam satu tempat.',
})

const features = [
  {
    icon: 'i-lucide-calendar-days',
    title: 'Kegiatan & pendaftaran jamaah',
    text: 'Publikasikan kajian dan acara, terima pendaftaran jamaah, dan catat kehadiran dengan rapi.',
  },
  {
    icon: 'i-lucide-wallet',
    title: 'Buku kas transparan',
    text: 'Catat pemasukan, pengeluaran, dan transfer antar akun. Laporan kas dapat dibuka jamaah kapan saja.',
  },
  {
    icon: 'i-lucide-monitor',
    title: 'Jadwal sholat & layar TV otomatis',
    text: 'Jadwal sholat dihitung otomatis sesuai lokasi masjid dan tampil di layar TV beserta kegiatan terdekat.',
  },
]

const { data: tenants, status, error, refresh } = await useFetch('/api/tenants', {
  default: () => [],
})

const q = ref('')
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  const list = tenants.value ?? []
  if (!term) return list
  return list.filter((t) => t.name.toLowerCase().includes(term))
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden cms-hero-grad-dark text-[oklch(0.95_0.015_155)]">
      <div class="absolute inset-0 cms-pattern-khatam opacity-[0.35]" />
      <div
        class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(ellipse at 30% 20%, oklch(0.55 0.10 155 / 0.35), transparent 60%);"
      />
      <div class="relative z-10 mx-auto max-w-[1120px] px-4 sm:px-6 py-16 sm:py-20">
        <div class="max-w-[640px]">
          <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-gold font-semibold mb-3 flex items-center">
            Assalamualaikum
          </div>
          <h1 class="font-serif text-[34px] sm:text-[46px] leading-[1.08] font-semibold mb-5 tracking-[-0.4px]">
            Satu tempat untuk mengelola masjid Anda.
          </h1>
          <p class="text-[15px] sm:text-[16px] text-[oklch(0.85_0.03_155)] leading-relaxed mb-8">
            OpenMasjid membantu pengurus mengelola kegiatan, buku kas, dan jadwal sholat masjid secara
            tertib dan terbuka bagi jamaah. Daftarkan masjid Anda dan mulai dalam beberapa menit.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton
              to="/register"
              size="xl"
              color="secondary"
              icon="i-lucide-plus"
              label="Daftarkan Masjid"
            />
            <UButton
              to="#direktori"
              size="xl"
              color="neutral"
              variant="outline"
              icon="i-lucide-search"
              label="Cari masjid"
              class="bg-transparent text-white ring-white/40 hover:bg-white/10"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="mx-auto max-w-[1120px] px-4 sm:px-6 py-12 sm:py-16">
      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="f in features"
          :key="f.title"
          class="rounded-cms-lg border border-cms-border bg-cms-surface shadow-cms p-6"
        >
          <span class="w-10 h-10 rounded-[12px] bg-cms-green-50 text-cms-green-700 grid place-items-center mb-4">
            <UIcon :name="f.icon" class="size-5" />
          </span>
          <h2 class="font-serif text-[19px] font-semibold text-cms-ink mb-2">
            {{ f.title }}
          </h2>
          <p class="text-[14px] text-cms-muted leading-relaxed m-0">
            {{ f.text }}
          </p>
        </div>
      </div>
    </section>

    <!-- Directory -->
    <section id="direktori" class="mx-auto max-w-[1120px] px-4 sm:px-6 pb-16 scroll-mt-20">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-green-700 font-semibold mb-2 flex items-center">
            Direktori
          </div>
          <h2 class="font-serif text-[28px] font-semibold m-0 text-cms-ink tracking-[-0.3px]">
            Masjid di OpenMasjid
          </h2>
        </div>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          placeholder="Cari nama masjid…"
          size="lg"
          class="w-full sm:w-[320px]"
          aria-label="Cari nama masjid"
        />
      </div>

      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        title="Gagal memuat daftar masjid"
        description="Periksa koneksi Anda lalu coba lagi."
        :actions="[{ label: 'Coba lagi', color: 'error', variant: 'outline', onClick: () => refresh() }]"
      />

      <div
        v-else-if="status !== 'pending' && filtered.length === 0"
        class="rounded-cms-lg border border-dashed border-cms-border-strong bg-cms-surface p-10 text-center"
      >
        <span class="w-12 h-12 rounded-full bg-cms-green-50 text-cms-green-700 grid place-items-center mx-auto mb-4">
          <UIcon name="i-lucide-landmark" class="size-6" />
        </span>
        <template v-if="(tenants?.length ?? 0) === 0">
          <p class="font-serif text-[18px] font-semibold text-cms-ink m-0 mb-1">
            Belum ada masjid terdaftar
          </p>
          <p class="text-[14px] text-cms-muted m-0 mb-5">
            Jadilah yang pertama mendaftarkan masjid Anda.
          </p>
          <UButton to="/register" icon="i-lucide-plus" label="Daftarkan Masjid" />
        </template>
        <template v-else>
          <p class="font-serif text-[18px] font-semibold text-cms-ink m-0 mb-1">
            Masjid tidak ditemukan
          </p>
          <p class="text-[14px] text-cms-muted m-0">
            Tidak ada masjid dengan nama “{{ q.trim() }}”.
          </p>
        </template>
      </div>

      <ul v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
        <li v-for="t in filtered" :key="t.slug">
          <NuxtLink
            :to="`/${t.slug}`"
            class="group flex items-center gap-3 rounded-cms-lg border border-cms-border bg-cms-surface p-4 hover:border-cms-green-500 hover:shadow-cms transition"
          >
            <span class="w-10 h-10 rounded-[12px] bg-cms-gold-soft text-cms-gold-ink grid place-items-center shrink-0">
              <UIcon name="i-lucide-landmark" class="size-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-[15px] text-cms-ink truncate">{{ t.name }}</span>
              <span class="block text-[12.5px] text-cms-muted truncate">/{{ t.slug }}</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-cms-muted-2 group-hover:text-cms-green-700 shrink-0" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
