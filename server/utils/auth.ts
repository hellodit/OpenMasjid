import { betterAuth, type BetterAuthOptions } from 'better-auth'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { DBAdapter, Where } from '@better-auth/core/db/adapter'
import { createError, defineEventHandler, type H3Event } from 'h3'
import { and, eq } from 'drizzle-orm'
import { db, withTenant, type DbOrTx } from './db'
import { accounts, sessions, users, verifications } from '../db/schema'
import type { UserRole } from '../../shared/types/auth'
import { requireTenant, type TenantContext } from './tenant'

/**
 * Accounts are per mosque: every tenant gets its own Better Auth instance with
 *  - basePath  /api/t/<slug>/auth   (handler: server/api/t/[tenant]/auth/[...all].ts)
 *  - cookies   prefixed `om_<slug>` so sessions of different mosques never mix
 *  - an adapter that scopes every `user` query to the tenant and stamps
 *    `tenantId` on sign-up, so the same email can exist in several mosques.
 *
 * The auth tables (users/sessions/accounts/verifications) are NOT under RLS
 * (Better Auth queries them outside a tenant transaction); isolation is the
 * adapter scoping + the tenant check in getAuthUser().
 */

const USER_MODELS = new Set(['user', 'users'])

function scopeUserAdapter(adapter: DBAdapter, tenantId: string): DBAdapter {
  const scope = (model: string, where: Where[] | undefined): Where[] | undefined =>
    USER_MODELS.has(model)
      ? [{ field: 'tenantId', value: tenantId, operator: 'eq', connector: 'AND' }, ...(where ?? [])]
      : where

  return new Proxy(adapter, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver)
      if (typeof original !== 'function') return original
      if (prop === 'create') {
        return (args: Parameters<DBAdapter['create']>[0]) =>
          original.call(target, USER_MODELS.has(args.model) ? { ...args, data: { ...args.data, tenantId } } : args)
      }
      if (prop === 'transaction') {
        return (cb: (trx: DBAdapter) => Promise<unknown>) =>
          original.call(target, (trx: DBAdapter) => cb(scopeUserAdapter(trx, tenantId)))
      }
      return (args: { model?: string, where?: Where[] } & Record<string, unknown>) =>
        args && typeof args === 'object' && typeof args.model === 'string'
          ? original.call(target, { ...args, where: scope(args.model, args.where) })
          : original.call(target, args)
    },
  })
}

function createTenantAuth(tenant: Pick<TenantContext, 'id' | 'slug'>) {
  const baseAdapter = drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  })

  return betterAuth({
    appName: 'OpenMasjid',
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: `/api/t/${tenant.slug}/auth`,
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean),
    database: ((options: BetterAuthOptions) =>
      scopeUserAdapter(baseAdapter(options) as DBAdapter, tenant.id)) as unknown as BetterAuthOptions['database'],
    advanced: {
      database: { generateId: 'uuid' },
      cookiePrefix: `om_${tenant.slug}`,
    },
    user: {
      fields: { name: 'fullName' },
      additionalFields: {
        tenantId: { type: 'string', required: false, input: false },
        role: { type: 'string', required: false, defaultValue: 'jamaah', input: false },
        phone: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false, defaultValue: true, input: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // TODO: wire a real mailer (SMTP/Resend). Until then the link is logged.
      sendResetPassword: async ({ user, url }) => {
        console.info(`[auth:${tenant.slug}] password reset for ${user.email}: ${url}`)
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const row = await db.query.users.findFirst({
              where: eq(users.id, session.userId),
              columns: { tenantId: true, isActive: true, deletedAt: true },
            })
            if (!row || row.tenantId !== tenant.id || !row.isActive || row.deletedAt)
              throw new APIError('FORBIDDEN', { message: 'Akun dinonaktifkan' })
            return { data: session }
          },
          after: async (session) => {
            await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, session.userId))
          },
        },
      },
    },
  })
}

export type TenantAuth = ReturnType<typeof createTenantAuth>

const instances = new Map<string, TenantAuth>()

/** Cached Better Auth instance for a tenant (keyed by id + slug). */
export function getTenantAuth(tenant: Pick<TenantContext, 'id' | 'slug'>): TenantAuth {
  const key = `${tenant.id}:${tenant.slug}`
  let auth = instances.get(key)
  if (!auth) {
    if (instances.size > 2_000) instances.clear()
    auth = createTenantAuth(tenant)
    instances.set(key, auth)
  }
  return auth
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  /** The tenant owner (an `admin` with team & danger-zone rights). */
  isOwner: boolean
}

/** Resolve the session for the current tenant from its cookies. Cached per request. */
export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  if (event.context.authUser !== undefined) return event.context.authUser
  const tenant = requireTenant(event)
  const result = await getTenantAuth(tenant).api.getSession({ headers: event.headers })
  let user: AuthUser | null = null
  if (result?.user) {
    // Re-read role/active state from DB: the session cookie cache may be stale.
    const row = await db.query.users.findFirst({
      where: and(eq(users.id, result.user.id), eq(users.tenantId, tenant.id)),
      columns: { id: true, email: true, fullName: true, role: true, isActive: true, deletedAt: true },
    })
    if (row && row.isActive && !row.deletedAt)
      user = { id: row.id, email: row.email, name: row.fullName, role: row.role, isOwner: tenant.ownerUserId === row.id }
  }
  event.context.authUser = user
  return user
}

export type Access = 'public' | 'staff' | 'admin' | 'owner'

export async function requireAccess(event: H3Event, access: Exclude<Access, 'public'>): Promise<AuthUser> {
  const user = await getAuthUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Silakan masuk terlebih dahulu' })
  const ok
    = access === 'staff' ? user.role === 'admin' || user.role === 'viewer'
      : access === 'admin' ? user.role === 'admin'
        : user.isOwner
  if (!ok) throw createError({ statusCode: 403, statusMessage: 'Anda tidak punya akses' })
  return user
}

export interface TenantHandlerContext<A extends Access> {
  tenant: TenantContext
  user: A extends 'public' ? AuthUser | null : AuthUser
  /** Tenant-scoped transaction (RLS `app.tenant_id` set). Use this, never the global `db`. */
  db: DbOrTx
}

/**
 * Handler for /api/t/<slug>/… routes:
 *  - `public`  no login (user resolved if present)
 *  - `staff`   admin + viewer (read)
 *  - `admin`   admin (write)
 *  - `owner`   tenant owner (team management)
 * The body runs inside `withTenant()`.
 */
export function defineTenantHandler<A extends Access, T>(
  access: A,
  handler: (event: H3Event, ctx: TenantHandlerContext<A>) => Promise<T>,
) {
  return defineEventHandler(async (event) => {
    const tenant = requireTenant(event)
    const user = access === 'public' ? await getAuthUser(event) : await requireAccess(event, access)
    return withTenant(tenant.id, (tx) =>
      handler(event, { tenant, user, db: tx } as TenantHandlerContext<A>),
    )
  })
}
