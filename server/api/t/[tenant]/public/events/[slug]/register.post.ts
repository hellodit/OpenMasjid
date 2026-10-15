/** Sign the current member up for an event (capacity-safe). */
export default defineTenantHandler('member', async (event, { db, tenant, user }) => {
  rateLimit(event, `register:${tenant.id}`, 30, 60_000)
  const ev = await findPublishedEvent(db, getRouterParam(event, 'slug') ?? '')
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })

  const profile = await getMosqueProfile(db)
  const row = await registerMember(db, {
    eventId: ev.id,
    userId: user.id,
    today: dateInTimeZone(tenant.timezone),
    mosqueRegistrationOpen: profile?.isRegistrationOpen ?? true,
  })

  setResponseStatus(event, 201)
  return {
    id: row.id,
    status: deriveRegistrantStatus(row),
    ticket: ticketCode(tenant.id, row.id),
  }
})
