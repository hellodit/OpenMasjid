import type { UserRole } from '#shared/types/auth'
import { STAFF_ROLES } from '#shared/types/auth'

/**
 * Session state shared across the app. Call `await useAuth().fetchSession()`
 * (route middleware does this) before reading `user` during SSR.
 */
type RawSession = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>['data']>

/**
 * What we keep in (SSR-serialized) state. The session token is deliberately
 * dropped: useState is embedded in the HTML payload, and the token lives in an
 * httpOnly cookie already.
 */
interface SessionData {
  user: RawSession['user']
  expiresAt: string | Date
}

function toSessionData(raw: RawSession | null | undefined): SessionData | null {
  return raw ? { user: raw.user, expiresAt: raw.session.expiresAt } : null
}

export function useAuth() {
  const session = useState<SessionData | null>(
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
    if (import.meta.server) {
      // The Better Auth client needs an absolute URL; on the server call the
      // handler in-process with the incoming cookies forwarded.
      const raw = await useRequestFetch()<RawSession | null>('/api/auth/get-session').catch(() => null)
      session.value = toSessionData(raw)
    }
    else {
      const { data } = await authClient.getSession()
      session.value = toSessionData(data)
    }
    loaded.value = true
    return session.value
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
