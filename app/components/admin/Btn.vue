<script setup lang="ts">
type Variant = 'default' | 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

withDefaults(defineProps<{
  variant?: Variant
  size?: Size
  as?: 'button' | 'a'
  to?: string
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'default',
  size: 'md',
  as: 'button',
  type: 'button',
})

const sizeMap: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-[46px] px-[22px] text-[15px]',
}

const variantMap: Record<Variant, string> = {
  default: 'border-cms-border bg-cms-surface text-cms-ink hover:bg-cms-surface-2',
  primary: 'border-cms-green-700 bg-cms-green-700 text-white hover:bg-cms-green-800 hover:border-cms-green-800 shadow-cms-primary',
  ghost: 'border-transparent bg-transparent text-cms-ink hover:bg-cms-green-100',
  danger: 'border-cms-rose-soft bg-cms-surface text-cms-rose hover:bg-cms-rose-soft',
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="[
      'inline-flex items-center gap-2 rounded-cms border font-semibold whitespace-nowrap transition-colors active:translate-y-px',
      sizeMap[size],
      variantMap[variant],
    ]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :class="[
      'inline-flex items-center gap-2 rounded-cms border font-semibold whitespace-nowrap transition-colors active:translate-y-px',
      sizeMap[size],
      variantMap[variant],
    ]"
  >
    <slot />
  </button>
</template>
