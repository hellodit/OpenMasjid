<script setup lang="ts">
type Tone = 'default' | 'gold' | 'info' | 'rose'

withDefaults(defineProps<{
  label: string
  num: string | number
  delta?: string
  icon: string
  tone?: Tone
}>(), { tone: 'default' })

const toneIcon: Record<Tone, string> = {
  default: 'bg-cms-green-100 text-cms-green-700',
  gold:    'bg-cms-gold-soft text-cms-gold-ink',
  info:    'bg-cms-info-soft text-cms-info',
  rose:    'bg-cms-rose-soft text-cms-rose',
}
</script>

<template>
  <div class="cms-stat-corner relative overflow-hidden bg-cms-surface border border-cms-border rounded-cms p-5">
    <div
      :class="[
        'w-[38px] h-[38px] rounded-[10px] grid place-items-center mb-3',
        toneIcon[tone],
      ]"
    >
      <Icon :name="icon" size="20" />
    </div>
    <div class="text-[12px] text-cms-muted uppercase tracking-[0.4px] font-semibold">
      {{ label }}
    </div>
    <div class="font-serif text-[30px] font-semibold mt-0.5 tracking-[-0.5px]">
      {{ num }}
    </div>
    <div v-if="delta" class="text-[12px] text-cms-green-700 mt-1 font-medium">
      ↑ {{ delta }}
    </div>
  </div>
</template>
