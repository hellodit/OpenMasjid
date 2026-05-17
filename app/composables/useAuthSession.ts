import { createClient, type SupabaseClient } from '@supabase/supabase-js'

interface SessionUser {
  id: string
  email: string | null
}

let _client: SupabaseClient | null = null
const _user = ref<SessionUser | null>(null)
const _accessToken = ref<string | null>(null)
const _ready = ref(false)

function getClient(): SupabaseClient {
  if (_client) return _client
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseAnonKey as string
  if (!url || !key) throw new Error('Supabase config missing')
  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: import.meta.client ? window.localStorage : undefined,
    },
  })
  return _client
}

export function useAuthSession() {
  if (import.meta.client && !_ready.value) {
    const client = getClient()
    client.auth.getSession().then(({ data }) => {
      if (data.session) {
        _user.value = { id: data.session.user.id, email: data.session.user.email ?? null }
        _accessToken.value = data.session.access_token
      }
      _ready.value = true
    })
    client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        _user.value = { id: session.user.id, email: session.user.email ?? null }
        _accessToken.value = session.access_token
      } else {
        _user.value = null
        _accessToken.value = null
      }
    })
  }

  async function signIn(email: string, password: string) {
    const client = getClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const client = getClient()
    await client.auth.signOut()
  }

  function authHeaders(): Record<string, string> {
    return _accessToken.value ? { Authorization: `Bearer ${_accessToken.value}` } : {}
  }

  return {
    user: readonly(_user),
    accessToken: readonly(_accessToken),
    ready: readonly(_ready),
    signIn,
    signOut,
    authHeaders,
  }
}
