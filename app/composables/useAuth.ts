import type { UserRole } from '#shared/types/auth'
import { STAFF_ROLES } from '#shared/types/auth'

/**
 * Session state shared across the app. Call `await useAuth().fetchSession()`
 * (route middleware does this) before reading `user` during SSR.
 */
export function useAuth() {
  const session = useState<Awaited<ReturnType<typeof authClient.getSession>>['data'] | null>(
    'auth:session',
    () => null,
  )
  const loaded = useState('auth:loaded', () => false)

  const user = computed(() => {
    const u = session.value?.user
    if (!u) return null
    return { ...u, role: (u.role ?? 'jamaah') as UserRole }
  })
  const isStaff = computed(() => !!user.value && STAFF_ROLES.includes(user.value.role))
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchSession(force = false) {
    if (loaded.value && !force) return session.value
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    const { data } = await authClient.getSession({ fetchOptions: { headers } })
    session.value = data
    loaded.value = true
    return data
  }

  async function signIn(email: string, password: string, rememberMe = true) {
    const { error } = await authClient.signIn.email({ email, password, rememberMe })
    if (error) throw error
    await fetchSession(true)
  }

  async function signOut() {
    await authClient.signOut()
    session.value = null
    await navigateTo('/auth/login')
  }

  return { session, user, isStaff, isAdmin, fetchSession, signIn, signOut }
}
