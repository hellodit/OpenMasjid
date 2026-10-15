import type { AuthUser } from '../utils/auth'

declare module 'h3' {
  interface H3EventContext {
    /** Set by getAuthUser(); `null` = resolved & anonymous. */
    authUser?: AuthUser | null
  }
}

export {}
