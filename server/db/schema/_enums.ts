import { pgEnum } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', [
  'owner',
  'admin',
  'editor',
  'viewer',
  'jamaah',
])

export const eventStatus = pgEnum('event_status', [
  'draft',
  'published',
  'ongoing',
  'full',
  'archived',
])

export const eventLanguage = pgEnum('event_language', [
  'id',
  'ar',
  'en',
  'mix',
])

export const eventTimeAnchor = pgEnum('event_time_anchor', [
  'fix',
  'subuh',
  'dhuhur',
  'ashar',
  'maghrib',
  'isya',
])

export const registrantSource = pgEnum('registrant_source', [
  'web',
  'qr',
  'admin',
])
