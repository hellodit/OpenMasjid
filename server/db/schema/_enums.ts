import { pgEnum } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['admin', 'viewer', 'jamaah'])

export const eventStatus = pgEnum('event_status', [
  'draft',
  'published',
  'ongoing',
  'full',
  'archived',
])

export const registrantSource = pgEnum('registrant_source', [
  'web',
  'qr',
  'admin',
])
