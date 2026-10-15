import { and, eq, sql } from 'drizzle-orm'
import { tenantInvitations, users } from '~~/server/db/schema'
import { invitationAcceptSchema } from '#shared/schemas/tenants'

/**
 * Accept an invitation: create the staff account (or, if the email already has
 * a jamaah account in this mosque, verify its password and upgrade it), then
 * sign the user in.
 */
export default defineTenantHandler('public', async (event, { db, tenant }) => {
  rateLimit(event, 'invite-accept', 10, 60_000)
  const invitation = await findOpenInvitation(db, getRouterParam(event, 'token'))
  const data = await readZodBody(event, invitationAcceptSchema)
  const auth = getTenantAuth(tenant)

  const existing = await db.query.users.findFirst({
    where: and(eq(users.tenantId, tenant.id), eq(sql`lower(${users.email})`, invitation.email)),
    columns: { id: true, role: true },
  })

  let signIn: Response
  if (existing) {
    // Prove ownership of the existing account before upgrading it.
    signIn = await auth.api.signInEmail({ body: { email: invitation.email, password: data.password }, asResponse: true })
    if (!signIn.ok) throw createError({ statusCode: 401, statusMessage: 'Email ini sudah terdaftar; masukkan password akun tersebut' })
    await db.update(users).set({ role: invitation.role, isActive: true }).where(eq(users.id, existing.id))
  }
  else {
    // Better Auth writes through its own connection; the tenant-scoped insert happens there.
    await createStaffUser(tenant, { name: data.name, email: invitation.email, password: data.password }, invitation.role as 'admin' | 'viewer')
    signIn = await auth.api.signInEmail({ body: { email: invitation.email, password: data.password }, asResponse: true })
  }

  await db.update(tenantInvitations).set({ acceptedAt: new Date() }).where(eq(tenantInvitations.id, invitation.id))
  forwardSetCookies(event, signIn)
  return { redirectTo: `/${tenant.slug}/admin` }
})
