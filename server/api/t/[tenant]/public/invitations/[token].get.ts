/** Invitation preview for the accept page. */
export default defineTenantHandler('public', async (event, { db, tenant }) => {
  rateLimit(event, 'invite-view', 30, 60_000)
  const invitation = await findOpenInvitation(db, getRouterParam(event, 'token'))
  return { email: invitation.email, role: invitation.role, mosque: tenant.name, expiresAt: invitation.expiresAt }
})
