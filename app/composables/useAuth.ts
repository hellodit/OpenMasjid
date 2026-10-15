import { STAFF_ROLES } from '#shared/types/auth'

/**
 * Auth state for the current mosque. Sessions are per tenant (separate
 * cookies), so everything is keyed by the `[tenant]` route param.
 * Route middleware loads the context before pages render (SSR-safe).
 */
export function useAuth() {
  const ctx = useTenantContext()
  const tp = useTenantPath()

  const user = ctx.user
  const isStaff = computed(() => !!user.value && STAFF_ROLES.includes(user.value.role))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isOwner = computed(() => !!user.value?.isOwner)

  async function signIn(email: string, password: string, rememberMe = true) {
    const { error } = await getAuthClient(ctx.slug.value).signIn.email({ email, password, rememberMe })
    if (error) throw error
    await ctx.load(true)
  }

  async function signOut() {
    await getAuthClient(ctx.slug.value).signOut()
    await ctx.load(true)
    await navigateTo(tp('/auth/login'))
  }

  return {
    user,
    isStaff,
    isAdmin,
    isOwner,
    fetchSession: (force = false) => ctx.load(force),
    signIn,
    signOut,
  }
}
