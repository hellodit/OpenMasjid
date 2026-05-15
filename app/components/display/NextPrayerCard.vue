<script setup lang="ts">
interface Props {
  name: string
  arabic: string
  time: string
  countdown: string
}
defineProps<Props>()
</script>

<template>
  <div
    class="next-card-bg relative overflow-hidden border border-line"
    style="border-radius: 1.46vw; padding: 2.1vw 2.3vw; box-shadow: 0 30px 60px -30px oklch(0.10 0.03 155 / 0.7);"
  >
    <div
      class="khatam-card-glyph absolute opacity-55"
      style="top: -4.7vw; right: -4.7vw; width: 14.6vw; height: 14.6vw;"
    />

    <div class="relative">
      <div class="uppercase text-gold-2" style="font-size: 0.63vw; letter-spacing: 0.27vw; margin-bottom: 0.52vw;">
        Sholat Berikutnya
      </div>
      <div class="font-serif font-semibold leading-none" style="font-size: 3.54vw; letter-spacing: -0.05vw;">{{ name }}</div>
      <div class="font-arab text-gold" dir="rtl" style="font-size: 1.98vw; margin-top: 0.21vw;">{{ arabic }}</div>
      <div class="font-mono font-medium text-ink" style="font-size: 2.92vw; margin-top: 0.83vw; letter-spacing: -0.05vw;">{{ time }}</div>

      <div
        class="uppercase text-muted"
        style="margin-top: 1.15vw; padding-top: 1.15vw; font-size: 0.73vw; letter-spacing: 0.10vw; border-top: 1px dashed oklch(0.40 0.05 155);"
      >
        Tersisa
        <b
          class="block font-serif text-gold font-semibold tracking-normal normal-case"
          style="font-size: 1.67vw; margin-top: 0.31vw;"
        >{{ countdown }}</b>
      </div>
    </div>
  </div>
</template>
