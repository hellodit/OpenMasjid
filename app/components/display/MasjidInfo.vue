<script setup lang="ts">
interface InfoItem {
  label: string
  value: string
  gold?: boolean
}

interface Props {
  items: InfoItem[]
}
defineProps<Props>()
</script>

<template>
  <div
    class="flex items-center border border-line"
    style="gap: 1.15vw; height: 4.58vw; padding: 0.73vw 1.35vw; border-radius: 0.83vw; background: oklch(0.16 0.04 155 / 0.6);"
  >
    <template v-for="(it, i) in items" :key="it.label">
      <div class="leading-tight">
        <div class="uppercase text-muted" style="font-size: 0.57vw; letter-spacing: 0.10vw;">{{ it.label }}</div>
        <div
          class="font-serif font-semibold"
          :class="it.gold ? 'text-gold' : ''"
          style="font-size: 1.04vw; margin-top: 0.21vw;"
        >
          {{ it.value }}
        </div>
      </div>
      <div
        v-if="i < items.length - 1"
        class="w-px bg-line"
        style="height: 1.98vw;"
      />
    </template>
  </div>
</template>
