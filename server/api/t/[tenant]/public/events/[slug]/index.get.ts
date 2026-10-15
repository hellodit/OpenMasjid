import { asc } from 'drizzle-orm'

/**
 * Public event detail (published only) + registration state.
 * When a member is signed in, their own registration and ticket are included.
 */
export default defineTenantHandler('public', async (event, { db, tenant, user }) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const ev = await findPublishedEvent(db, slug)
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })

  const [category, speakers, agenda, registered, profile] = await Promise.all([
    db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.id, ev.categoryId),
      columns: { slug: true, name: true, icon: true, colorToken: true },
    }),
    db.query.eventSpeakers.findMany({
      where: (s, { eq }) => eq(s.eventId, ev.id),
      columns: { name: true, role: true },
      orderBy: (s) => [asc(s.sortOrder)],
    }),
    db.query.eventAgendaItems.findMany({
      where: (a, { eq }) => eq(a.eventId, ev.id),
      columns: { startTime: true, endTime: true, title: true, person: true },
      orderBy: (a) => [asc(a.sortOrder)],
    }),
    activeRegistrationCount(db, ev.id),
    getMosqueProfile(db),
  ])

  const today = dateInTimeZone(tenant.timezone)
  const mine = user ? await findOwnRegistration(db, ev.id, user.id) : null

  return {
    event: {
      id: ev.id,
      slug: ev.slug,
      title: ev.title,
      arabicTitle: ev.arabicTitle,
      description: ev.description,
      tags: ev.tags,
      startDate: ev.startDate,
      endDate: ev.endDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      locationName: ev.locationName,
      locationDetail: ev.locationDetail,
      addressFull: ev.addressFull,
      capacity: ev.capacity,
      bannerUrl: ev.bannerUrl,
      isLivestream: ev.isLivestream,
      livestreamUrl: ev.isLivestream ? ev.livestreamUrl : null,
      requiresRegistration: ev.requiresRegistration,
      displayStatus: deriveEventStatus(ev, registered, today),
    },
    category: category ?? null,
    speakers,
    agenda,
    registeredCount: registered,
    availability: registrationAvailability(ev, registered, today, profile?.isRegistrationOpen ?? true),
    myRegistration: mine
      ? {
          id: mine.id,
          status: deriveRegistrantStatus(mine),
          registeredAt: mine.registeredAt,
          attendedAt: mine.attendedAt,
          ticket: mine.cancelledAt ? null : ticketCode(tenant.id, mine.id),
        }
      : null,
  }
})
