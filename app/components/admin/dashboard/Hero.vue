<script setup lang="ts">
interface Prayer { name: string, time: string, now?: boolean }

defineProps<{
  name: string
  description: string
  arabic: string
  date: string
  prayers: Prayer[]
}>()
</script>

<template>
  <div class="cms-hero-grad-dark relative rounded-cms-lg text-white px-9 py-8 overflow-hidden mb-[22px] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-7 items-center">
    <div class="cms-pattern-strip absolute inset-0 opacity-40 pointer-events-none" />
    <div class="relative z-[1]">
      <div class="font-serif text-[13px] tracking-[1px] uppercase mb-2 text-[oklch(0.85_0.05_78)]">
        Assalamu'alaikum Warahmatullah
      </div>
      <h1 class="font-serif text-[34px] font-semibold m-0 mb-1.5 tracking-[-0.5px] leading-[1.15]">
        Selamat datang, {{ name }}
      </h1>
      <p class="m-0 opacity-85 max-w-[480px] text-sm">{{ description }}</p>
      <div class="font-serif text-[26px] mt-3.5 text-[oklch(0.92_0.03_78)] tracking-[1px]">
        {{ arabic }}
      </div>
    </div>

    <div class="relative z-[1] bg-white/10 backdrop-blur border border-white/15 rounded-cms p-4">
      <div class="flex items-center justify-between text-[12px] tracking-[0.6px] uppercase text-[oklch(0.85_0.04_155)] mb-2.5 font-semibold">
        <span>Jadwal Sholat — {{ date }}</span>
        <span class="text-cms-gold">● Live</span>
      </div>
      <div class="grid grid-cols-5 gap-1.5 text-center">
        <div
          v-for="p in prayers"
          :key="p.name"
          :class="[
            'rounded-lg py-2 px-1',
            p.now ? 'bg-cms-gold text-cms-green-900' : 'bg-white/5',
          ]"
        >
          <div class="text-[10px] tracking-[0.5px] uppercase opacity-80 font-semibold">{{ p.name }}</div>
          <div class="font-mono text-[13px] font-bold mt-0.5">{{ p.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
