<script setup lang="ts">
/** TV slide: duty roster (Friday prayer officials, or today's imams). */
export interface DutySlideColumn {
  /** Column heading, e.g. "Khatib" or "Subuh". */
  label: string
  people: { role?: string, name: string }[]
}

interface Props {
  title: string
  dateLabel: string
  columns: DutySlideColumn[]
  topic?: string | null
}
withDefaults(defineProps<Props>(), { topic: null })
</script>

<template>
  <div class="relative z-10">
    <div
      class="flex items-center text-tv-gold-2 uppercase"
      style="gap: 1.04vw; margin-bottom: 1.15vw; font-size: 0.68vw; letter-spacing: 0.26vw;"
    >
      {{ title }}
      <span class="text-tv-muted normal-case" style="letter-spacing: 0.05vw; font-size: 0.78vw;">· {{ dateLabel }}</span>
      <span
        class="flex-1 h-px"
        style="background: linear-gradient(90deg, oklch(0.32 0.05 155), transparent);"
      />
    </div>

    <div
      class="border border-tv-line"
      style="border-radius: 0.94vw; padding: 1.5vw 2vw; background: oklch(0.16 0.04 155 / 0.6);"
    >
      <div
        class="grid"
        :style="`grid-template-columns: repeat(${Math.min(columns.length, 5)}, minmax(0, 1fr)); gap: 0 2vw;`"
      >
        <div
          v-for="(col, i) in columns.slice(0, 5)"
          :key="col.label"
          class="leading-tight min-w-0"
          :class="i ? 'border-l border-tv-line' : ''"
          :style="i ? 'padding-left: 2vw;' : ''"
        >
          <div class="uppercase text-tv-gold" style="font-size: 0.75vw; letter-spacing: 0.18vw;">
            {{ col.label }}
          </div>
          <div
            v-for="(p, j) in col.people.slice(0, 3)"
            :key="j"
            style="margin-top: 0.6vw;"
          >
            <div v-if="p.role" class="uppercase text-tv-muted" style="font-size: 0.6vw; letter-spacing: 0.12vw;">
              {{ p.role }}
            </div>
            <div
              class="font-serif font-semibold text-tv-ink line-clamp-2"
              :style="col.people.length > 1 ? 'font-size: 1.3vw;' : 'font-size: 1.6vw; line-height: 1.15;'"
            >
              {{ p.name }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="topic"
        class="border-t border-tv-line flex items-baseline"
        style="margin-top: 1.2vw; padding-top: 1vw; gap: 1vw;"
      >
        <span class="uppercase text-tv-muted shrink-0" style="font-size: 0.7vw; letter-spacing: 0.18vw;">Tema khutbah</span>
        <span class="font-serif italic text-tv-gold-2 truncate" style="font-size: 1.35vw;">“{{ topic }}”</span>
      </div>
    </div>
  </div>
</template>
