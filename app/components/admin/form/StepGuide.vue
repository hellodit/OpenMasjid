<script setup lang="ts">
/** Static section navigator for long forms (anchors to section ids). */
defineProps<{ steps: { id: string, t: string, d: string }[] }>()
</script>

<template>
  <nav class="bg-cms-surface border border-cms-border rounded-cms-lg p-6 lg:sticky lg:top-0">
    <h4 class="font-serif text-[16px] m-0 mb-1 font-semibold">Bagian Formulir</h4>
    <p class="text-cms-muted text-[13px] m-0 mb-3.5">
      Lengkapi tiap bagian agar kegiatan tampil rapi pada portal jamaah.
    </p>
    <a
      v-for="(s, i) in steps"
      :key="s.id"
      :href="`#${s.id}`"
      :class="['flex gap-2.5 py-2.5 group', i > 0 ? 'border-t border-dashed border-cms-border' : '']"
    >
      <div class="w-6 h-6 shrink-0 rounded-full grid place-items-center text-[12px] font-bold bg-cms-green-100 text-cms-green-800 group-hover:bg-cms-green-700 group-hover:text-white transition-colors">
        {{ i + 1 }}
      </div>
      <div>
        <div class="text-[13px] font-semibold group-hover:text-cms-green-700">{{ s.t }}</div>
        <div class="text-[12px] text-cms-muted mt-0.5">{{ s.d }}</div>
      </div>
    </a>
  </nav>
</template>
