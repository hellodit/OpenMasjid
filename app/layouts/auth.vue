<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'id' },
  bodyAttrs: { class: 'bg-cms-bg text-cms-ink font-sans antialiased' },
})

const year = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
    <!-- Brand panel (kiri, desktop) -->
    <aside
      class="hidden lg:flex relative overflow-hidden cms-hero-grad-dark text-[oklch(0.95_0.015_155)]"
    >
      <div class="absolute inset-0 cms-pattern-khatam opacity-[0.35]" />
      <div
        class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(ellipse at 30% 20%, oklch(0.55 0.10 155 / 0.35), transparent 60%);"
      />

      <div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
        <div class="flex items-center gap-3">
          <div class="w-[44px] h-[44px] rounded-[12px] bg-cms-gold grid place-items-center text-cms-green-900 shrink-0">
            <AdminStarMark :size="26" />
          </div>
          <div>
            <div class="font-serif text-[20px] font-semibold leading-[1.1] tracking-[0.2px]">
              Masjidku
            </div>
            <div class="text-[11px] uppercase tracking-[1.5px] text-[oklch(0.78_0.04_155)] mt-0.5">
              Event Management
            </div>
          </div>
        </div>

        <div class="max-w-[460px]">
          <div class="cms-eyebrow text-[12px] uppercase tracking-[1.5px] text-cms-gold font-semibold mb-3 flex items-center">
            Assalamualaikum
          </div>
          <h2 class="font-serif text-[40px] xl:text-[44px] leading-[1.1] font-semibold mb-5">
            Kelola kegiatan masjid dengan tenang &amp; tertib.
          </h2>
          <p class="text-[15px] text-[oklch(0.85_0.03_155)] leading-relaxed">
            Pantau jadwal kajian, pendaftaran jamaah, dan donasi dalam satu dasbor yang ringan, rapi, dan mudah dipakai pengurus masjid.
          </p>

          <div class="mt-10 flex items-center gap-6 text-[oklch(0.78_0.04_155)]">
            <div>
              <div class="font-serif text-[28px] text-white">1.284</div>
              <div class="text-[11px] uppercase tracking-[1.2px] mt-0.5">Jamaah aktif</div>
            </div>
            <div class="w-px h-10 bg-[oklch(0.40_0.08_155)]" />
            <div>
              <div class="font-serif text-[28px] text-white">48</div>
              <div class="text-[11px] uppercase tracking-[1.2px] mt-0.5">Kegiatan / bulan</div>
            </div>
            <div class="w-px h-10 bg-[oklch(0.40_0.08_155)]" />
            <div>
              <div class="font-serif text-[28px] text-white">12</div>
              <div class="text-[11px] uppercase tracking-[1.2px] mt-0.5">Masjid terhubung</div>
            </div>
          </div>
        </div>

        <div class="text-[12px] text-[oklch(0.70_0.04_155)] flex items-center justify-between">
          <span>© {{ year }} Masjidku. Hak cipta dilindungi.</span>
          <span class="font-arab text-[18px] text-cms-gold-2 tracking-wide">بَارَكَ اللَّهُ فِيْكُمْ</span>
        </div>
      </div>
    </aside>

    <!-- Form panel (kanan) -->
    <section class="flex items-center justify-center px-5 py-10 sm:px-8">
      <div class="w-full max-w-[440px]">
        <!-- Brand bar (hanya mobile) -->
        <div class="flex items-center gap-3 mb-8 lg:hidden">
          <div class="w-[38px] h-[38px] rounded-[10px] bg-cms-green-700 grid place-items-center text-white shrink-0">
            <AdminStarMark :size="22" />
          </div>
          <div>
            <div class="font-serif text-[18px] font-semibold leading-[1.1] text-cms-ink">
              Masjidku
            </div>
            <div class="text-[10.5px] uppercase tracking-[1.2px] text-cms-muted mt-0.5">
              Event Management
            </div>
          </div>
        </div>

        <slot />
      </div>
    </section>
  </div>
</template>
