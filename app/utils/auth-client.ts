import { createAuthClient } from 'better-auth/vue'
import { inferAdditionalFields } from 'better-auth/client/plugins'

/**
 * Better Auth client. Same-origin, so no baseURL is needed: requests go to
 * /api/auth/* and the session lives in an httpOnly cookie (works on SSR too).
 */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string', required: false, input: false },
        phone: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false, input: false },
      },
    }),
  ],
})
