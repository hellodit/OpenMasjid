import { sql } from 'drizzle-orm'
import {
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { events } from './events'
import { users } from './users'
import { registrantSource } from './_enums'

export const registrants = pgTable(
  'registrants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    registeredAt: timestamp('registered_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    attendedAt: timestamp('attended_at', { withTimezone: true }),
    checkedInBy: uuid('checked_in_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    source: registrantSource('source').notNull().default('web'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('registrants_event_user_active_unique')
      .on(t.eventId, t.userId)
      .where(sql`${t.deletedAt} IS NULL`),
    index('registrants_event_attended_idx')
      .on(t.eventId)
      .where(sql`${t.attendedAt} IS NOT NULL`),
    index('registrants_user_history_idx').on(t.userId, t.registeredAt),
    check(
      'registrants_attended_after_registered',
      sql`${t.attendedAt} IS NULL OR ${t.attendedAt} >= ${t.registeredAt}`,
    ),
  ],
)
