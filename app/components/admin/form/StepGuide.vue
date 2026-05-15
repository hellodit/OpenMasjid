<script setup lang="ts">
interface Step { t: string, d: string, done?: boolean }

defineProps<{ steps: Step[] }>()
</script>

<template>
  <div class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 sticky top-0">
    <h4 class="font-serif text-[16px] m-0 mb-1 font-semibold">Langkah Pengisian</h4>
    <p class="text-cms-muted text-[13px] m-0 mb-3.5">
      Ikuti urutan ini agar kegiatan tampil rapi pada portal jamaah.
    </p>
    <div
      v-for="(s, i) in steps"
      :key="i"
      :class="['flex gap-2.5 py-2.5', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div
        :class="[
          'w-6 h-6 shrink-0 rounded-full grid place-items-center text-[12px] font-bold',
          s.done ? 'bg-cms-green-700 text-white' : 'bg-cms-green-100 text-cms-green-800',
        ]"
      >
        {{ i + 1 }}
      </div>
      <div>
        <div class="text-[13px] font-semibold">{{ s.t }}</div>
        <div class="text-[12px] text-cms-muted mt-0.5">{{ s.d }}</div>
      </div>
    </div>
  </div>
</template>
