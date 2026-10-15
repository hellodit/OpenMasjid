import type { AuthUser } from '../utils/auth'
import type { TenantContext } from '../utils/tenant'

declare module 'h3' {
  interface H3EventContext {
    /** Set by server/middleware/00.tenant.ts for /api/t/<slug>/… routes. */
    tenant?: TenantContext
    /** Set by getAuthUser(); `null` = resolved & anonymous. */
    authUser?: AuthUser | null
  }
}

export {}
