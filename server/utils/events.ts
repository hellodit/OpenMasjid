import { and, count, eq, inArray, isNull, sql } from 'drizzle-orm'
import { createError } from 'h3'
import slugify from 'slugify'
import type { z } from 'zod'
import type { DbOrTx } from './db'
import { eventAgendaItems, events, eventSpeakers, registrants } from '../db/schema'
import { deriveEventStatus } from '../../shared/utils/events'
import type { eventCreateSchema } from '../../shared/schemas/events'

/** Active (not cancelled / deleted) and attended registrant counts per event. */
export async function registrantCounts(db: DbOrTx, eventIds: string[]) {
  const map = new Map<string, { registered: number, attended: number }>()
  if (!eventIds.length) return map
  const rows = await db
    .select({
      eventId: registrants.eventId,
      registered: count(),
      attended: sql<number>`COUNT(${registrants.attendedAt})::int`,
    })
    .from(registrants)
    .where(
      and(
        inArray(registrants.eventId, eventIds),
        isNull(registrants.deletedAt),
        isNull(registrants.cancelledAt),
      ),
    )
    .groupBy(registrants.eventId)
  for (const r of rows) map.set(r.eventId, { registered: r.registered, attended: r.attended })
  return map
}

/** Attach `registeredCount`, `attendedCount` and derived `displayStatus`. */
export async function withEventStats<
  T extends { id: string, status: string, startDate: string, endDate: string | null, capacity: number | null },
>(db: DbOrTx, rows: T[], today: string) {
  const counts = await registrantCounts(db, rows.map((r) => r.id))
  return rows.map((r) => {
    const c = counts.get(r.id) ?? { registered: 0, attended: 0 }
    return {
      ...r,
      registeredCount: c.registered,
      attendedCount: c.attended,
      displayStatus: deriveEventStatus(r, c.registered, today),
    }
  })
}


/** Unique slug among non-deleted events (appends -2, -3, … on collision). */
export async function uniqueEventSlug(db: DbOrTx, base: string, excludeId?: string): Promise<string> {
  const root = base || 'kegiatan'
  for (let i = 1; i < 100; i++) {
    const slug = i === 1 ? root : `${root}-${i}`
    const hit = await db.query.events.findFirst({
      where: (e, { and, eq, isNull, ne }) =>
        and(eq(e.slug, slug), isNull(e.deletedAt), excludeId ? ne(e.id, excludeId) : undefined),
      columns: { id: true },
    })
    if (!hit) return slug
  }
  return `${root}-${Date.now()}`
}

type EventPayload = z.output<typeof eventCreateSchema>

/** Insert or replace an event with its speakers & agenda atomically. */
export async function saveEvent(db: DbOrTx, data: EventPayload, userId: string, existingId?: string) {
  const { speakers, agenda, slug: requestedSlug, ...fields } = data
  const slug = await uniqueEventSlug(
    db,
    requestedSlug ?? slugify(fields.title, { lower: true, strict: true }),
    existingId,
  )

  return db.transaction(async (tx) => {
    let id = existingId
    if (id) {
      const current = await tx.query.events.findFirst({
        where: (e, { and, eq, isNull }) => and(eq(e.id, id!), isNull(e.deletedAt)),
        columns: { status: true, publishedAt: true },
      })
      if (!current) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })
      await tx
        .update(events)
        .set({
          ...fields,
          slug,
          updatedBy: userId,
          publishedAt: fields.status === 'published' ? (current.publishedAt ?? new Date()) : current.publishedAt,
        })
        .where(eq(events.id, id))
      await tx.delete(eventSpeakers).where(eq(eventSpeakers.eventId, id))
      await tx.delete(eventAgendaItems).where(eq(eventAgendaItems.eventId, id))
    }
    else {
      const [row] = await tx
        .insert(events)
        .values({
          ...fields,
          slug,
          createdBy: userId,
          updatedBy: userId,
          publishedAt: fields.status === 'published' ? new Date() : null,
        })
        .returning({ id: events.id })
      id = row!.id
    }

    if (speakers.length)
      await tx.insert(eventSpeakers).values(speakers.map((s, i) => ({ ...s, eventId: id!, sortOrder: i })))
    if (agenda.length)
      await tx.insert(eventAgendaItems).values(agenda.map((a, i) => ({ ...a, eventId: id!, sortOrder: i })))
    return id!
  })
}

export async function assertEventCategory(db: DbOrTx, categoryId: string) {
  const cat = await db.query.categories.findFirst({
    where: (c, { and, eq, isNull }) => and(eq(c.id, categoryId), isNull(c.deletedAt)),
    columns: { id: true, isActive: true },
  })
  if (!cat) throw createError({ statusCode: 400, statusMessage: 'Kategori tidak ditemukan' })
  if (!cat.isActive) throw createError({ statusCode: 400, statusMessage: 'Kategori sudah diarsipkan' })
}
