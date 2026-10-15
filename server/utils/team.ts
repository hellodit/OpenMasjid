import { createHash } from 'node:crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { createError } from 'h3'
import { db as rootDb, type DbOrTx } from './db'
import { sessions, tenantInvitations } from '../db/schema'

/** Open (not accepted/revoked/expired) invitation by raw token, or 404. */
export async function findOpenInvitation(db: DbOrTx, token: string | undefined) {
  if (!token || token.length < 20) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak valid' })
  const invitation = await db.query.tenantInvitations.findFirst({
    where: and(
      eq(tenantInvitations.tokenHash, createHash('sha256').update(token).digest('hex')),
      isNull(tenantInvitations.acceptedAt),
      isNull(tenantInvitations.revokedAt),
      gt(tenantInvitations.expiresAt, new Date()),
    ),
  })
  if (!invitation) throw createError({ statusCode: 404, statusMessage: 'Undangan tidak valid atau sudah kedaluwarsa' })
  return invitation
}

/** Sign a user out everywhere (sessions table is not tenant-scoped). */
export async function revokeUserSessions(_db: DbOrTx, userId: string) {
  await rootDb.delete(sessions).where(eq(sessions.userId, userId))
}
