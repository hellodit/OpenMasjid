<script setup lang="ts">
/**
 * Thin wrapper around Nuxt UI `UButton` that keeps the CMS variant names.
 * Prefer `UButton` directly in new code.
 */
type Variant = 'default' | 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: Variant
  size?: Size
  to?: string
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'default',
  size: 'md',
  type: 'button',
})

const look = computed(() => ({
  default: { color: 'neutral', variant: 'outline' },
  primary: { color: 'primary', variant: 'solid' },
  ghost: { color: 'neutral', variant: 'ghost' },
  danger: { color: 'error', variant: 'outline' },
} as const)[props.variant])

const uiSize = computed(() => ({ sm: 'sm', md: 'md', lg: 'lg' } as const)[props.size])
</script>

<template>
  <UButton
    :to="to"
    :type="type"
    :color="look.color"
    :variant="look.variant"
    :size="uiSize"
    :loading="loading"
    :disabled="disabled"
    class="font-semibold"
  >
    <slot />
  </UButton>
</template>
