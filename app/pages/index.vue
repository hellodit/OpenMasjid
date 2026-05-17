<script setup lang="ts">
import type { CategoryId } from '~/composables/useAdminMock'

definePageMeta({ layout: false })
useHead({
  title: 'Masjid Al-Hikmah — OpenMasjid',
  htmlAttrs: { lang: 'id' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color', content: '#1f3b2d' },
    { name: 'description', content: 'Profil, jadwal sholat, dan kegiatan rutin Masjid Al-Hikmah.' },
  ],
})

const { now, timeHHMM, gregorianDate, hijriDate } = useDisplayClock()
const { prayers, next, countdown } = usePrayerSchedule(now)
const { EVENTS, CATEGORIES } = useAdminMock()

const masjid = {
  name: 'Masjid Al-Hikmah',
  arabic: 'مسجد الحكمة',
  tagline: 'Tempat berhimpun jamaah, menjaga ibadah, dan merawat ilmu.',
  address: "Jl. KH. Hasyim Asy'ari No. 24, Sukamaju, Jakarta Selatan",
  district: 'RW 03 / Kelurahan Sukamaju',
  phone: '+62 21 8500 1234',
  email: 'dkm@openmasjid.id',
  hours: 'Setiap hari · 04:00 — 22:00',
  jumatTime: "Jumat · Adzan 11:45 · Khutbah 12:00",
  capacity: '1.200 jamaah',
  founded: '1987',
}

type FilterId = 'all' | CategoryId
const activeFilter = ref<FilterId>('all')

const publicEvents = computed(() =>
  EVENTS.filter(e => e.status === 'published' || e.status === 'ongoing'),
)

const filteredEvents = computed(() =>
  activeFilter.value === 'all'
    ? publicEvents.value
    : publicEvents.value.filter(e => e.cat === activeFilter.value),
)

const statusTone: Record<string, { label: string, cls: string }> = {
  published: { label: 'Pendaftaran dibuka', cls: 'bg-cms-green-100 text-cms-green-800' },
  ongoing:   { label: 'Sedang berjalan',    cls: 'bg-cms-gold-soft text-cms-gold-ink' },
  full:      { label: 'Kuota penuh',        cls: 'bg-cms-rose-soft text-cms-rose' },
  draft:     { label: 'Akan datang',        cls: 'bg-cms-info-soft text-cms-info' },
}
</script>

<template>
  <div class="min-h-screen bg-cms-bg text-cms-ink font-sans antialiased">
    <!-- Sticky top bar -->
    <header
      class="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-cms-border"
    >
      <div class="mx-auto max-w-2xl flex items-center gap-3 px-4 py-3">
        <div class="w-9 h-9 rounded-[10px] bg-cms-green-800 grid place-items-center text-cms-gold shrink-0">
          <AdminStarMark :size="20" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-serif text-[15px] font-semibold leading-tight truncate">
            {{ masjid.name }}
          </div>
          <div class="text-[11px] text-cms-muted truncate">
            OpenMasjid · Profil & Kegiatan
          </div>
        </div>
        <NuxtLink
          to="/display"
          target="_blank"
          class="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-cms-border bg-white px-3 py-1.5 text-[12px] font-semibold text-cms-green-800 hover:bg-cms-green-50 active:scale-[0.97] transition"
          aria-label="Buka tampilan Display TV"
        >
          <Icon name="lucide:tv" size="14" />
          <span class="hidden sm:inline">Display TV</span>
        </NuxtLink>
        <div class="text-right shrink-0">
          <div class="font-mono text-[14px] font-semibold tabular-nums text-cms-ink">
            {{ timeHHMM }}
          </div>
          <div class="text-[10px] uppercase tracking-[0.8px] text-cms-muted">
            WIB
          </div>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-cms-green-900 text-white">
      <!-- Subtle ornament -->
      <div
        aria-hidden="true"
        class="absolute inset-0 opacity-[0.07] pointer-events-none"
        style="background-image: radial-gradient(circle at 25% 20%, oklch(0.78 0.10 78) 0, transparent 35%), radial-gradient(circle at 80% 80%, oklch(0.55 0.10 155) 0, transparent 40%);"
      />
      <div class="relative mx-auto max-w-2xl px-5 pt-9 pb-10">
        <div class="text-[11px] uppercase tracking-[2px] text-cms-gold-soft font-semibold mb-3">
          Assalamualaikum
        </div>
        <div class="font-arab text-[28px] leading-none text-cms-gold mb-4">
          {{ masjid.arabic }}
        </div>
        <h1 class="font-serif text-[28px] sm:text-[34px] leading-[1.15] font-semibold mb-3">
          {{ masjid.name }}
        </h1>
        <p class="text-[14.5px] leading-relaxed text-white/80 max-w-md">
          {{ masjid.tagline }}
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <a
            href="#jadwal-sholat"
            class="inline-flex items-center gap-2 rounded-full bg-cms-gold text-cms-green-900 px-4 py-2 text-[13px] font-semibold shadow-cms-sm active:scale-[0.98] transition"
          >
            <Icon name="lucide:clock" size="15" />
            Jadwal sholat hari ini
          </a>
          <a
            href="#kegiatan"
            class="inline-flex items-center gap-2 rounded-full border border-white/25 text-white px-4 py-2 text-[13px] font-semibold active:bg-white/10 transition"
          >
            <Icon name="lucide:calendar-days" size="15" />
            Lihat kegiatan
          </a>
        </div>
      </div>
    </section>

    <!-- Prayer card -->
    <section id="jadwal-sholat" class="px-4 pt-6 mb-8">
      <div class="mx-auto max-w-2xl bg-white rounded-cms-lg border border-cms-border shadow-cms overflow-hidden">
        <!-- Next prayer highlight -->
        <div class="p-5 bg-gradient-to-br from-cms-green-50 to-white border-b border-cms-border">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] uppercase tracking-[1.2px] text-cms-muted font-semibold">
                Sholat selanjutnya
              </div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="font-serif text-[26px] font-semibold text-cms-green-900">
                  {{ next.name }}
                </span>
                <span class="font-arab text-[18px] text-cms-gold-ink">{{ next.ar }}</span>
              </div>
              <div class="text-[12.5px] text-cms-ink-2 mt-1">
                Iqamah <span class="font-semibold">{{ next.iq }}</span> · {{ countdown }}
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="font-mono text-[32px] font-semibold text-cms-green-800 tabular-nums leading-none">
                {{ next.time }}
              </div>
              <div class="text-[11px] uppercase tracking-[1px] text-cms-muted mt-1">
                Adzan
              </div>
            </div>
          </div>
          <div class="mt-3 text-[11px] text-cms-muted-2">
            {{ gregorianDate }} · {{ hijriDate }}
          </div>
        </div>

        <!-- 5-prayer grid -->
        <ul class="grid grid-cols-5 divide-x divide-cms-border">
          <li
            v-for="p in prayers"
            :key="p.id"
            class="px-2 py-3 text-center"
            :class="[
              p.isNext ? 'bg-cms-gold-soft' : '',
              p.isCurrent ? 'bg-cms-green-100' : '',
              p.isPassed ? 'opacity-55' : '',
            ]"
          >
            <div
              class="text-[10.5px] uppercase tracking-[0.6px] font-semibold"
              :class="p.isNext ? 'text-cms-gold-ink' : 'text-cms-muted'"
            >
              {{ p.name }}
            </div>
            <div
              class="font-mono text-[14px] font-semibold tabular-nums mt-1"
              :class="p.isNext ? 'text-cms-green-900' : 'text-cms-ink'"
            >
              {{ p.time }}
            </div>
            <div class="text-[10px] text-cms-muted mt-0.5">
              iq {{ p.iq }}
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Profile card -->
    <section class="px-4 mb-10">
      <div class="mx-auto max-w-2xl">
        <div class="flex items-center gap-2 mb-3">
          <Icon name="lucide:landmark" size="16" class="text-cms-green-700" />
          <h2 class="font-serif text-[18px] font-semibold">Profil Masjid</h2>
        </div>

        <div class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm divide-y divide-cms-border">
          <div class="p-4 flex items-start gap-3">
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:map-pin" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Alamat</div>
              <div class="text-[14px] mt-0.5">{{ masjid.address }}</div>
              <div class="text-[12.5px] text-cms-muted-2 mt-0.5">{{ masjid.district }}</div>
            </div>
          </div>

          <div class="p-4 flex items-start gap-3">
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:clock-3" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Jam buka</div>
              <div class="text-[14px] mt-0.5">{{ masjid.hours }}</div>
              <div class="text-[12.5px] text-cms-muted-2 mt-0.5">{{ masjid.jumatTime }}</div>
            </div>
          </div>

          <a
            :href="`tel:${masjid.phone.replace(/\s/g, '')}`"
            class="p-4 flex items-start gap-3 active:bg-cms-surface-2 transition"
          >
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:phone" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Telepon DKM</div>
              <div class="text-[14px] mt-0.5 font-medium">{{ masjid.phone }}</div>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="text-cms-muted self-center" />
          </a>

          <a
            :href="`mailto:${masjid.email}`"
            class="p-4 flex items-start gap-3 active:bg-cms-surface-2 transition"
          >
            <div class="w-9 h-9 rounded-cms bg-cms-green-100 text-cms-green-800 grid place-items-center shrink-0">
              <Icon name="lucide:mail" size="16" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Email</div>
              <div class="text-[14px] mt-0.5 font-medium break-all">{{ masjid.email }}</div>
            </div>
            <Icon name="lucide:chevron-right" size="16" class="text-cms-muted self-center" />
          </a>

          <div class="p-4 grid grid-cols-2 gap-3">
            <div>
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Kapasitas</div>
              <div class="text-[14px] mt-0.5 font-medium">{{ masjid.capacity }}</div>
            </div>
            <div>
              <div class="text-[11px] uppercase tracking-[0.6px] text-cms-muted font-semibold">Berdiri sejak</div>
              <div class="text-[14px] mt-0.5 font-medium">{{ masjid.founded }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Events -->
    <section id="kegiatan" class="px-4 mb-12">
      <div class="mx-auto max-w-2xl">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Icon name="lucide:calendar-days" size="16" class="text-cms-green-700" />
            <h2 class="font-serif text-[18px] font-semibold">Kegiatan Mendatang</h2>
          </div>
          <span class="text-[12px] text-cms-muted">{{ filteredEvents.length }} kegiatan</span>
        </div>

        <!-- Filter chips -->
        <div class="-mx-4 px-4 mb-4 overflow-x-auto scrollbar-none">
          <div class="flex gap-2 w-max">
            <button
              type="button"
              class="px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition active:scale-[0.97]"
              :class="activeFilter === 'all'
                ? 'bg-cms-green-800 text-white border-cms-green-800'
                : 'bg-white text-cms-ink-2 border-cms-border'"
              @click="activeFilter = 'all'"
            >
              Semua
            </button>
            <button
              v-for="c in CATEGORIES"
              :key="c.id"
              type="button"
              class="px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition active:scale-[0.97] inline-flex items-center gap-1.5"
              :class="activeFilter === c.id
                ? 'bg-cms-green-800 text-white border-cms-green-800'
                : 'bg-white text-cms-ink-2 border-cms-border'"
              @click="activeFilter = c.id"
            >
              <Icon :name="c.icon" size="13" />
              {{ c.name }}
            </button>
          </div>
        </div>

        <!-- Event list -->
        <div v-if="filteredEvents.length" class="space-y-3">
          <article
            v-for="ev in filteredEvents"
            :key="ev.id"
            class="bg-white rounded-cms-lg border border-cms-border shadow-cms-sm overflow-hidden"
          >
            <div class="flex gap-3 p-4">
              <!-- Date block -->
              <div class="shrink-0 w-14 rounded-cms bg-cms-green-50 border border-cms-green-100 text-center py-2">
                <div class="text-[10.5px] uppercase tracking-[0.6px] text-cms-green-700 font-semibold">
                  {{ ev.m }}
                </div>
                <div class="font-serif text-[22px] font-semibold text-cms-green-900 leading-none mt-0.5">
                  {{ ev.d }}
                </div>
                <div class="text-[10px] text-cms-muted mt-1">{{ ev.day }}</div>
              </div>

              <!-- Body -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-[10.5px] uppercase tracking-[0.6px] text-cms-gold-ink font-semibold">
                    {{ ev.catName }}
                  </span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.4px]"
                    :class="statusTone[ev.status].cls"
                  >
                    {{ statusTone[ev.status].label }}
                  </span>
                </div>
                <h3 class="font-serif text-[16px] font-semibold leading-[1.25] mb-1.5">
                  {{ ev.title }}
                </h3>
                <p class="text-[12.5px] text-cms-ink-2 line-clamp-2 mb-2.5">
                  {{ ev.desc }}
                </p>

                <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-cms-muted-2">
                  <span class="inline-flex items-center gap-1">
                    <Icon name="lucide:clock" size="12" />
                    {{ ev.time }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <Icon name="lucide:map-pin" size="12" />
                    {{ ev.location }}
                  </span>
                </div>

                <div class="mt-2.5 pt-2.5 border-t border-cms-border flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <div class="text-[12px] font-semibold truncate">{{ ev.speaker }}</div>
                    <div class="text-[11px] text-cms-muted truncate">{{ ev.role }}</div>
                  </div>
                  <button
                    type="button"
                    class="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-cms-green-800 active:text-cms-green-900"
                  >
                    Detail
                    <Icon name="lucide:arrow-right" size="13" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div
          v-else
          class="bg-white rounded-cms-lg border border-dashed border-cms-border px-4 py-10 text-center"
        >
          <Icon name="lucide:calendar-x-2" size="22" class="text-cms-muted mx-auto mb-2" />
          <div class="text-[13.5px] font-semibold text-cms-ink-2">Belum ada kegiatan</div>
          <div class="text-[12px] text-cms-muted mt-1">
            Tidak ada kegiatan terjadwal untuk kategori ini.
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-cms-green-900 text-white/80 mt-4">
      <div class="mx-auto max-w-2xl px-5 py-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-[10px] bg-cms-gold grid place-items-center text-cms-green-900">
            <AdminStarMark :size="22" />
          </div>
          <div>
            <div class="font-serif text-[16px] font-semibold text-white leading-tight">
              {{ masjid.name }}
            </div>
            <div class="text-[11px] uppercase tracking-[1.2px] text-cms-gold-soft mt-0.5">
              Powered by OpenMasjid
            </div>
          </div>
        </div>
        <p class="text-[12.5px] leading-relaxed text-white/65 mb-5">
          {{ masjid.address }}
        </p>
        <div class="flex items-center justify-between text-[11px] text-white/55 pt-4 border-t border-white/10">
          <span>© {{ new Date().getFullYear() }} OpenMasjid</span>
          <span class="font-arab text-[14px] text-cms-gold-2">بَارَكَ اللَّهُ فِيْكُمْ</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { scrollbar-width: none; }
</style>
