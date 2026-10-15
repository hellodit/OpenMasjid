<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { initials } from '~/utils/format'

/** Portal header: "Masuk" when signed out, account menu when signed in. */
const tp = useTenantPath()
const route = useRoute()
const toast = useToast()
const ctx = useTenantContext()
const { user, isStaff } = useAuth()

const firstName = computed(() => user.value?.name.split(/\s+/)[0] ?? '')

async function onSignOut() {
  try {
    await getAuthClient(ctx.slug.value).signOut()
  }
  finally {
    await ctx.load(true)
  }
  toast.add({ title: 'Anda telah keluar', icon: 'i-lucide-log-out', color: 'neutral' })
  // Member-only pages would bounce to login; send them home instead.
  if (route.path.startsWith(tp('/my-tickets'))) await navigateTo(tp('/'))
}

const items = computed<DropdownMenuItem[][]>(() => {
  const main: DropdownMenuItem[] = [
    { label: 'Tiket saya', icon: 'i-lucide-ticket', to: tp('/my-tickets') },
  ]
  if (isStaff.value) main.push({ label: 'Dasbor pengurus', icon: 'i-lucide-layout-dashboard', to: tp('/admin') })
  return [
    [{ label: user.value?.name ?? '', description: user.value?.email, type: 'label' }],
    main,
    [{ label: 'Keluar', icon: 'i-lucide-log-out', color: 'error', onSelect: () => { void onSignOut() } }],
  ]
})
</script>

<template>
  <UDropdownMenu v-if="user" :items="items" :content="{ align: 'end' }" :ui="{ content: 'min-w-56' }">
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      trailing-icon="i-lucide-chevron-down"
      class="shrink-0 rounded-full text-[12px] font-semibold text-cms-green-800 max-w-[160px]"
      :aria-label="`Akun ${user.name}`"
    >
      <span class="w-5 h-5 rounded-full bg-cms-green-800 text-cms-gold text-[10px] font-bold grid place-items-center shrink-0">
        {{ initials(user.name, 1) || '?' }}
      </span>
      <span class="truncate hidden sm:inline">{{ firstName }}</span>
    </UButton>
  </UDropdownMenu>
  <UButton
    v-else
    :to="{ path: tp('/auth/login'), query: { redirect: route.fullPath } }"
    color="primary"
    size="sm"
    icon="i-lucide-log-in"
    class="shrink-0 rounded-full text-[12px] font-semibold"
  >
    Masuk
  </UButton>
</template>
