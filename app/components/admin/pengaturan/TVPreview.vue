<script setup lang="ts">
interface Cell { key: string, label: string, time: string, iq?: number }
defineProps<{ cells: Cell[], activeKey: string, place: string, date: string, hijri: string, current: string, currentTime: string, countdown: string }>()
</script>

<template>
  <div class="relative rounded-cms px-4 pt-4 pb-4 text-white overflow-hidden mt-1.5 cms-hero-grad-dark">
    <div class="cms-pattern-strip absolute inset-0 opacity-30" />
    <div class="relative z-[1]">
      <div class="flex items-start justify-between text-[11px] text-[oklch(0.85_0.04_155)] tracking-[0.4px] uppercase font-semibold mb-4">
        <div>{{ place }}</div>
        <div class="text-right leading-tight">
          {{ date }}<br><span class="text-cms-gold">{{ hijri }}</span>
        </div>
      </div>

      <div class="bg-white/5 border border-white/15 rounded-[10px] px-3.5 py-3 text-center mb-3">
        <div class="text-[10.5px] tracking-[0.6px] uppercase text-cms-gold font-semibold">
          Sekarang · {{ current }}
        </div>
        <div class="font-serif text-[38px] font-bold tracking-[-1px] my-0.5">{{ currentTime }}</div>
        <div class="font-mono text-[11px] text-[oklch(0.88_0.03_155)] tracking-[0.4px]">— {{ countdown }}</div>
      </div>

      <div class="grid grid-cols-5 gap-1 text-center">
        <div
          v-for="c in cells"
          :key="c.key"
          :class="[
            'rounded-lg py-2 px-1 border',
            c.key === activeKey
              ? 'bg-cms-gold text-cms-green-900 border-cms-gold'
              : 'bg-white/[0.06] border-transparent',
          ]"
        >
          <div class="text-[9.5px] tracking-[0.4px] uppercase font-semibold opacity-85">{{ c.label }}</div>
          <div class="font-mono text-[13px] font-bold mt-0.5">{{ c.time }}</div>
          <div
            v-if="c.iq != null"
            :class="['text-[9px] tracking-[0.2px] font-medium', c.key === activeKey ? 'text-[oklch(0.36_0.06_155)]' : 'text-[oklch(0.82_0.04_78)]']"
          >
            iqamah +{{ c.iq }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
