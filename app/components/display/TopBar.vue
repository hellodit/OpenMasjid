<script setup lang="ts">
interface Props {
  name: string
  address: string
  time: string
}
defineProps<Props>()
</script>

<template>
  <div class="relative z-10 flex items-center justify-between flex-shrink-0">
    <div class="flex items-center" style="gap: 0.94vw;">
      <div
        class="grid place-items-center bg-gold text-bg"
        style="width: 2.92vw; height: 2.92vw; border-radius: 0.73vw; box-shadow: 0 0 0 1px oklch(0.85 0.07 78 / 0.5), 0 8px 32px -12px oklch(0.78 0.10 78 / 0.5);"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.56vw"
          height="1.56vw"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 2 L14.5 7 L20 7 L20 12.5 L22 14 L20 15.5 L20 21 L14.5 21 L12 22 L9.5 21 L4 21 L4 15.5 L2 14 L4 12.5 L4 7 L9.5 7 Z" />
          <circle cx="12" cy="14" r="2.5" />
        </svg>
      </div>
      <div>
        <div class="font-serif font-semibold" style="font-size: 1.25vw; letter-spacing: 0.026vw;">{{ name }}</div>
        <div class="uppercase text-muted" style="font-size: 0.63vw; letter-spacing: 0.16vw; margin-top: 0.21vw;">{{ address }}</div>
      </div>
    </div>

    <div class="text-right text-ink-2" style="font-size: 0.73vw; letter-spacing: 0.026vw;">
      <span class="font-mono font-medium">{{ time }}</span>
      <span class="inline-flex items-center text-gold" style="margin-left: 0.83vw; gap: 0.42vw;">
        <span class="rounded-full bg-gold animate-gold-pulse" style="width: 0.42vw; height: 0.42vw;" />
        SIARAN LANGSUNG
      </span>
    </div>
  </div>
</template>
