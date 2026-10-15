import { createAuthClient } from 'better-auth/vue'
import { inferAdditionalFields } from 'better-auth/client/plugins'

function create(slug: string) {
  return createAuthClient({
    // Accounts are per mosque: each tenant has its own Better Auth endpoint
    // (server/api/t/[tenant]/auth/[...all].ts) and cookie prefix.
    basePath: `/api/t/${slug}/auth`,
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
}

export type TenantAuthClient = ReturnType<typeof create>

const clients = new Map<string, TenantAuthClient>()

/** Browser-side Better Auth client for one mosque (same-origin, cookie session). */
export function getAuthClient(slug: string): TenantAuthClient {
  let client = clients.get(slug)
  if (!client) {
    client = create(slug)
    clients.set(slug, client)
  }
  return client
}
