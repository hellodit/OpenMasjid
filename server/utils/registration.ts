import { createHmac, timingSafeEqual } from 'node:crypto'
import { and, count, eq, isNull, sql } from 'drizzle-orm'
import { createError } from 'h3'
import type { DbOrTx } from './db'
import { events, registrants } from '../db/schema'
import { REGISTRATION_AVAILABILITY_LABELS, registrationAvailability } from '../../shared/utils/events'

// ─── QR e-tickets ──────────────────────────────────────────────────────────
// Code = "om1.<registrantId>.<sig>", sig = HMAC-SHA256(secret, "<tenantId>:<registrantId>")
// truncated to 22 base64url chars (~128 bits). Binding the tenant id means a
// ticket from one mosque can never check in at another, and the code reveals
// nothing beyond an opaque id.

const PREFIX = 'om1'

function secret(): string {
  const s = process.env.TICKET_SECRET || process.env.BETTER_AUTH_SECRET
  if (!s) throw new Error('TICKET_SECRET / BETTER_AUTH_SECRET is not set')
  return s
}

function sign(tenantId: string, registrantId: string): string {
  return createHmac('sha256', secret()).update(`${tenantId}:${registrantId}`).digest('base64url').slice(0, 22)
}

export function ticketCode(tenantId: string, registrantId: string): string {
  return `${PREFIX}.${registrantId}.${sign(tenantId, registrantId)}`
}

/** Registrant id if the code is a valid ticket of this tenant, else null. */
export function verifyTicketCode(tenantId: string, code: string): string | null {
  const parts = code.trim().split('.')
  if (parts.length !== 3 || parts[0] !== PREFIX) return null
  const [, id, sig] = parts as [string, string, string]
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const expected = Buffer.from(sign(tenantId, id))
  const given = Buffer.from(sig)
  return given.length === expected.length && timingSafeEqual(given, expected) ? id : null
}

// ─── Registration ──────────────────────────────────────────────────────────

/** Published, non-deleted event by slug (RLS-scoped db). */
export async function findPublishedEvent(db: DbOrTx, slug: string) {
  return (
    (await db.query.events.findFirst({
      where: and(eq(events.slug, slug), isNull(events.deletedAt), eq(events.status, 'published')),
    })) ?? null
  )
}

export async function activeRegistrationCount(db: DbOrTx, eventId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(registrants)
    .where(and(eq(registrants.eventId, eventId), isNull(registrants.deletedAt), isNull(registrants.cancelledAt)))
  return row?.n ?? 0
}

export async function findOwnRegistration(db: DbOrTx, eventId: string, userId: string) {
  return (
    (await db.query.registrants.findFirst({
      where: and(eq(registrants.eventId, eventId), eq(registrants.userId, userId), isNull(registrants.deletedAt)),
    })) ?? null
  )
}

/**
 * Register a member for an event. Must run inside the tenant transaction:
 * the event row is locked (FOR UPDATE) so concurrent sign-ups cannot exceed
 * the capacity.
 */
export async function registerMember(
  db: DbOrTx,
  input: { eventId: string, userId: string, today: string, mosqueRegistrationOpen: boolean },
) {
  const locked = await db.execute(sql`select id from ${events} where id = ${input.eventId} for update`)
  if (!(locked as unknown as unknown[]).length) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })

  const event = await db.query.events.findFirst({ where: eq(events.id, input.eventId) })
  if (!event) throw createError({ statusCode: 404, statusMessage: 'Kegiatan tidak ditemukan' })

  const existing = await findOwnRegistration(db, event.id, input.userId)
  if (existing && !existing.cancelledAt)
    throw createError({ statusCode: 409, statusMessage: 'Anda sudah terdaftar di kegiatan ini' })

  const registered = await activeRegistrationCount(db, event.id)
  const availability = registrationAvailability(event, registered, input.today, input.mosqueRegistrationOpen)
  if (availability !== 'open') {
    throw createError({
      statusCode: availability === 'full' ? 409 : 400,
      statusMessage: REGISTRATION_AVAILABILITY_LABELS[availability],
    })
  }

  if (existing) {
    // Re-register after a cancellation: reuse the row (unique per event+user).
    const [row] = await db
      .update(registrants)
      .set({ cancelledAt: null, attendedAt: null, checkedInBy: null, registeredAt: new Date(), source: 'web' })
      .where(eq(registrants.id, existing.id))
      .returning()
    return row!
  }
  const [row] = await db
    .insert(registrants)
    .values({ eventId: event.id, userId: input.userId, source: 'web' })
    .returning()
  return row!
}
