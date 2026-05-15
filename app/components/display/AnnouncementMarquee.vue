<script setup lang="ts">
interface Announcement {
  prefix: string
  body: string
}

interface Props {
  items: Announcement[]
}
defineProps<Props>()
</script>

<template>
  <div
    class="relative flex items-center overflow-hidden border border-line"
    style="height: 4.58vw; border-radius: 0.83vw; background: oklch(0.16 0.04 155 / 0.6);"
  >
    <div
      class="relative z-[2] flex items-center h-full bg-gold text-bg font-bold uppercase"
      style="gap: 0.63vw; padding: 0 1.46vw; font-size: 0.73vw; letter-spacing: 0.21vw; box-shadow: 6px 0 12px -6px oklch(0.10 0.03 155 / 0.6);"
    >
      <svg
        width="0.94vw"
        height="0.94vw"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M2 11v3a4 4 0 0 0 4 4h2l5 4V3L8 7H6a4 4 0 0 0-4 4z" />
      </svg>
      Pengumuman
    </div>

    <div class="flex-1 overflow-hidden relative">
      <div
        class="flex whitespace-nowrap animate-marquee-scroll w-max"
        style="gap: 4.17vw; padding-left: 2.08vw;"
      >
        <span
          v-for="(item, i) in [...items, ...items]"
          :key="i"
          class="inline-flex items-center text-ink"
          style="gap: 0.73vw; font-size: 1.15vw;"
        >
          <b class="text-gold font-semibold" style="margin-right: 0.31vw;">{{ item.prefix }}</b>
          {{ item.body }}
          <span class="text-gold" style="font-size: 0.73vw;">✦</span>
        </span>
      </div>
    </div>
  </div>
</template>
