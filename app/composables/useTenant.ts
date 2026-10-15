/**
 * Current mosque (tenant) from the `[tenant]` route param.
 * Every tenant page lives under app/pages/[tenant]/ and talks to /api/t/<slug>/….
 */
export function useTenantSlug() {
  const route = useRoute()
  return computed(() => {
    const p = route.params.tenant
    return (Array.isArray(p) ? p[0] : p) ?? ''
  })
}

/** Base URL of the tenant API, e.g. `/api/t/al-hikmah`. */
export type TenantApiBase = `/api/t/${string}`

/**
 * Typed as a template literal so `useFetch(`${api}/admin/events`)` still
 * infers response types from Nitro's `/api/t/:tenant/...` routes.
 */
export function useApiBase(): TenantApiBase {
  return `/api/t/${useTenantSlug().value}`
}

/** Prefix an in-tenant path: tp('/admin/events') → '/al-hikmah/admin/events'. */
export function useTenantPath() {
  const slug = useTenantSlug()
  return (path = '/') => `/${slug.value}${path === '/' ? '' : path}`
}

export interface TenantInfo {
  slug: string
  name: string
  timezone: string
}

export interface ContextUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'viewer' | 'member'
  isOwner: boolean
}

interface TenantContextState {
  tenant: TenantInfo | null
  user: ContextUser | null
  /** 'missing' when the slug does not resolve to a mosque. */
  status: 'idle' | 'ok' | 'missing'
}

/**
 * Tenant + signed-in user, loaded from /api/t/<slug>/context and kept in
 * useState per slug (no session token is ever serialized).
 */
export function useTenantContext(slugOverride?: string) {
  // Route middleware must not call useRoute(); it passes `to.params.tenant` instead.
  const slug = slugOverride !== undefined ? computed(() => slugOverride) : useTenantSlug()
  const state = useState<Record<string, TenantContextState>>('tenant:ctx', () => ({}))

  const current = computed<TenantContextState>(() => state.value[slug.value] ?? { tenant: null, user: null, status: 'idle' })

  async function load(force = false) {
    const s = slug.value
    if (!s) return current.value
    if (!force && state.value[s]?.status && state.value[s]!.status !== 'idle') return state.value[s]!
    const fetcher = import.meta.server ? useRequestFetch() : $fetch
    try {
      const res = await fetcher<{ tenant: TenantInfo, user: ContextUser | null }>(`/api/t/${s}/context`)
      state.value = { ...state.value, [s]: { tenant: res.tenant, user: res.user, status: 'ok' } }
    }
    catch {
      state.value = { ...state.value, [s]: { tenant: null, user: null, status: 'missing' } }
    }
    return state.value[s]!
  }

  return {
    slug,
    tenant: computed(() => current.value.tenant),
    user: computed(() => current.value.user),
    status: computed(() => current.value.status),
    load,
  }
}
