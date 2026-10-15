import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createError, type H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { accounts, sessions, users, verifications } from '../db/schema'
import type { UserRole } from '../../shared/types/auth'

/**
 * Better Auth instance. Reads `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
 * from the environment (Better Auth's own convention), so it also works in
 * CLI scripts (scripts/seed.ts) outside of Nitro.
 *
 * Mounted at /api/auth/* by server/api/auth/[...all].ts.
 */
export const auth = betterAuth({
  appName: 'OpenMasjid',
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  advanced: {
    database: { generateId: 'uuid' },
  },
  user: {
    fields: { name: 'fullName' },
    additionalFields: {
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
    // TODO: wire a real mailer (SMTP/Resend). Until then the link is logged
    // on the server so an operator can hand it over manually.
    sendResetPassword: async ({ user, url }) => {
      console.info(`[auth] password reset for ${user.email}: ${url}`)
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const row = await db.query.users.findFirst({
            where: eq(users.id, session.userId),
            columns: { isActive: true, deletedAt: true },
          })
          if (!row || !row.isActive || row.deletedAt)
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

export type Auth = typeof auth

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}

/** Resolve the session from the request cookies. Cached per request. */
export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  if (event.context.authUser !== undefined) return event.context.authUser
  const result = await auth.api.getSession({ headers: event.headers })
  let user: AuthUser | null = null
  if (result?.user) {
    // Re-read role/active state from DB: the session cookie cache may be stale.
    const row = await db.query.users.findFirst({
      where: eq(users.id, result.user.id),
      columns: { id: true, email: true, fullName: true, role: true, isActive: true, deletedAt: true },
    })
    if (row && row.isActive && !row.deletedAt)
      user = { id: row.id, email: row.email, name: row.fullName, role: row.role }
  }
  event.context.authUser = user
  return user
}

export async function requireAuth(event: H3Event, roles?: UserRole[]): Promise<AuthUser> {
  const user = await getAuthUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Silakan masuk terlebih dahulu' })
  if (roles && !roles.includes(user.role))
    throw createError({ statusCode: 403, statusMessage: 'Anda tidak punya akses' })
  return user
}

/** Read access to the CMS: `admin` and `viewer`. */
export const requireStaff = (event: H3Event) => requireAuth(event, ['admin', 'viewer'])

/** Write access to the CMS: `admin` only. */
export const requireAdmin = (event: H3Event) => requireAuth(event, ['admin'])
