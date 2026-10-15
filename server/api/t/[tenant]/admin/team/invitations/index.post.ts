import { createHash, randomBytes } from 'node:crypto'
import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import { tenantInvitations, users } from '~~/server/db/schema'
import { invitationCreateSchema } from '#shared/schemas/tenants'

const INVITE_TTL_MS = 7 * 24 * 60 * 60_000

/**
 * Invite a pengurus by email. No mailer yet: the one-time link is returned
 * (shown once to the owner) and logged on the server.
 */
export default defineTenantHandler('owner', async (event, { db, tenant, user }) => {
  rateLimit(event, `invite:${tenant.id}`, 30, 60 * 60_000)
  const data = await readZodBody(event, invitationCreateSchema)

  const existingStaff = await db.query.users.findFirst({
    where: and(
      eq(users.tenantId, tenant.id),
      eq(sql`lower(${users.email})`, data.email),
      inArray(users.role, ['admin', 'viewer']),
      isNull(users.deletedAt),
    ),
    columns: { id: true },
  })
  if (existingStaff) throw createError({ statusCode: 409, statusMessage: 'Email ini sudah menjadi pengurus' })

  // Only one open invitation per email.
  await db
    .update(tenantInvitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(tenantInvitations.email, data.email), isNull(tenantInvitations.acceptedAt), isNull(tenantInvitations.revokedAt)))

  const token = randomBytes(32).toString('base64url')
  const [row] = await db
    .insert(tenantInvitations)
    .values({
      email: data.email,
      role: data.role,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      invitedBy: user.id,
    })
    .returning({ id: tenantInvitations.id, email: tenantInvitations.email, role: tenantInvitations.role, expiresAt: tenantInvitations.expiresAt })

  const origin = process.env.BETTER_AUTH_URL ?? getRequestURL(event).origin
  const url = `${origin}/${tenant.slug}/auth/accept-invite?token=${token}`
  console.info(`[invite:${tenant.slug}] ${data.email} (${data.role}): ${url}`)

  setResponseStatus(event, 201)
  return { invitation: row, url }
})
