import { eq } from 'drizzle-orm'
import { db } from './db'
import { MOSQUE_PROFILE_SINGLETON_ID, mosqueProfile } from '../db/schema'

export const DEFAULT_TIMEZONE = 'Asia/Jakarta'

export async function getMosqueProfile() {
  return (
    (await db.query.mosqueProfile.findFirst({
      where: eq(mosqueProfile.id, MOSQUE_PROFILE_SINGLETON_ID),
    })) ?? null
  )
}

/** The mosque's IANA timezone (falls back to Asia/Jakarta). */
export async function getMosqueTimezone(): Promise<string> {
  const row = await db.query.mosqueProfile.findFirst({
    where: eq(mosqueProfile.id, MOSQUE_PROFILE_SINGLETON_ID),
    columns: { timezone: true },
  })
  return row?.timezone || DEFAULT_TIMEZONE
}
